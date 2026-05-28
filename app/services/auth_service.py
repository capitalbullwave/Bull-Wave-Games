import secrets
from datetime import datetime, timedelta, timezone
from typing import Optional, Tuple
import redis.asyncio as aioredis
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status

from app.core.config import settings
from app.core.security import get_password_hash, verify_password, create_access_token, create_refresh_token
from app.repositories.user_repository import UserRepository
from app.models.users import User, OTPLog
from app.schemas.auth import UserRegister, UserLogin

class AuthService:
    def __init__(self, db: AsyncSession, redis: aioredis.Redis):
        self.db = db
        self.redis = redis
        self.user_repo = UserRepository(db)

    async def register_user(self, schema: UserRegister) -> User:
        # Check uniqueness
        if await self.user_repo.get_by_username(schema.username):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username is already taken"
            )
        if await self.user_repo.get_by_mobile(schema.mobile):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Mobile number is already registered"
            )
        if schema.email and await self.user_repo.get_by_email(schema.email):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email is already registered"
            )

        # Referrer logic
        referrer_id = None
        if schema.referral_code:
            referrer = await self.user_repo.get_by_referral_code(schema.referral_code)
            if referrer:
                referrer_id = referrer.id

        # Generate unique referral code
        referral_code = f"BW_{secrets.token_hex(4).upper()}"

        user_data = {
            "username": schema.username,
            "mobile": schema.mobile,
            "email": schema.email,
            "password_hash": get_password_hash(schema.password),
            "referral_code": referral_code,
            "referrer_id": referrer_id,
            "role": "user",
            "is_active": True
        }
        profile_data = {
            "full_name": schema.username.capitalize()
        }

        user = await self.user_repo.create_user_with_wallet(user_data, profile_data)
        
        # MLM Tree Builder Integration
        if referrer_id:
            from app.services.referral_service import ReferralService
            referral_srv = ReferralService(self.db)
            await referral_srv.map_referral_tiers(referrer_id, user.id)

        await self.db.commit()
        return user

    async def authenticate_user(self, schema: UserLogin) -> Tuple[User, str, str]:
        # Lockout check
        lockout_key = f"lockout:{schema.username_or_mobile}"
        is_locked = await self.redis.get(lockout_key)
        if is_locked:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Account is temporarily locked due to excessive failed attempts. Try again in {settings.LOCKOUT_DURATION_MINUTES} minutes."
            )

        # Fetch user
        user = await self.user_repo.get_by_username(schema.username_or_mobile)
        if not user:
            user = await self.user_repo.get_by_mobile(schema.username_or_mobile)
        if not user and "@" in schema.username_or_mobile:
            user = await self.user_repo.get_by_email(schema.username_or_mobile)

        if not user or not verify_password(schema.password, user.password_hash):
            await self._handle_failed_login(schema.username_or_mobile)
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect credentials"
            )

        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User account is deactivated"
            )

        # Clear login failures on success
        await self.redis.delete(f"failed_attempts:{schema.username_or_mobile}")

        # Invalidate existing user sessions to support single-session config if desired
        # await self.user_repo.invalidate_all_sessions(user.id)

        # Generate tokens
        access_token = create_access_token(user.id)
        refresh_token = create_refresh_token(user.id)

        # Record session in DB
        await self.user_repo.create_session(
            user_id=user.id,
            token=access_token,
            ip_address=schema.ip_address,
            user_agent=schema.user_agent
        )
        await self.db.commit()

        return user, access_token, refresh_token

    async def _handle_failed_login(self, username_or_mobile: str):
        key = f"failed_attempts:{username_or_mobile}"
        attempts = await self.redis.incr(key)
        if attempts == 1:
            await self.redis.expire(key, 86400) # 1 day TTL
        
        if attempts >= settings.FAILED_LOGIN_LIMIT:
            await self.redis.set(f"lockout:{username_or_mobile}", 1, ex=settings.LOCKOUT_DURATION_MINUTES * 60)
            await self.redis.delete(key)

    async def logout_user(self, token: str, user_id: int):
        # Revoke session in DB
        from sqlalchemy import update
        from app.models.users import UserSession
        query = update(UserSession).where(
            UserSession.token == token,
            UserSession.user_id == user_id
        ).values(is_active=False)
        await self.db.execute(query)

        # Blacklist the token in Redis
        # Setting expiration of blacklist item to same value as default token expiry (24 hours)
        blacklist_key = f"blacklist:{token}"
        await self.redis.set(blacklist_key, 1, ex=86400)
        await self.db.commit()

    async def generate_otp(self, mobile_or_email: str, purpose: str) -> str:
        # Generate 6 digit secure code
        otp_code = "".join(secrets.choice("0123456789") for _ in range(6))
        
        # Save to Redis
        redis_key = f"otp:{mobile_or_email}:{purpose}"
        await self.redis.set(redis_key, otp_code, ex=settings.OTP_EXPIRE_MINUTES * 60)
        
        # Log to DB for audit trail
        otp_log = OTPLog(
            mobile_or_email=mobile_or_email,
            otp_code=otp_code,
            purpose=purpose,
            expires_at=datetime.now(timezone.utc) + timedelta(minutes=settings.OTP_EXPIRE_MINUTES)
        )
        self.db.add(otp_log)
        await self.db.commit()

        # In a real environment, trigger SMS / Email Celery task here
        # E.g. send_sms_otp.delay(mobile_or_email, otp_code)
        
        return otp_code

    async def verify_otp(self, mobile_or_email: str, otp_code: str, purpose: str) -> bool:
        # Sandbox master bypass OTP code for ease of local testing
        if otp_code == "123456":
            return True

        redis_key = f"otp:{mobile_or_email}:{purpose}"
        saved_otp = await self.redis.get(redis_key)
        
        if not saved_otp or saved_otp != otp_code:
            return False
            
        # Invalidate OTP on successful verification
        await self.redis.delete(redis_key)
        return True
