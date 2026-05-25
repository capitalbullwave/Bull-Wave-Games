from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.ext.asyncio import AsyncSession
import redis.asyncio as aioredis
from typing import Any

from app.core.database import get_async_db
from app.core.deps import get_redis, get_current_user, security_bearer
from app.schemas.auth import UserRegister, UserLogin, Token, RefreshTokenRequest, ForgotPasswordRequest, ResetPasswordRequest, OTPVerifyRequest, OTPResendRequest
from app.schemas.users import UserResponse
from app.services.auth_service import AuthService
from app.core.security import verify_token, create_access_token

router = APIRouter()

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(
    schema: UserRegister,
    db: AsyncSession = Depends(get_async_db),
    redis: aioredis.Redis = Depends(get_redis)
) -> Any:
    auth_service = AuthService(db, redis)
    user = await auth_service.register_user(schema)
    return user

@router.post("/login", response_model=Token)
async def login(
    request: Request,
    schema: UserLogin,
    db: AsyncSession = Depends(get_async_db),
    redis: aioredis.Redis = Depends(get_redis)
) -> Any:
    # Enrich session metadata from HTTP context
    schema.ip_address = request.client.host if request.client else "unknown"
    schema.user_agent = request.headers.get("user-agent", "unknown")
    
    auth_service = AuthService(db, redis)
    user, access_token, refresh_token = await auth_service.authenticate_user(schema)
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }

@router.post("/logout", status_code=status.HTTP_200_OK)
async def logout(
    token_credentials = Depends(security_bearer),
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db),
    redis: aioredis.Redis = Depends(get_redis)
) -> Any:
    if not token_credentials:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authorization token is missing")
    
    auth_service = AuthService(db, redis)
    await auth_service.logout_user(token_credentials.credentials, current_user.id)
    return {"detail": "Successfully logged out from current session"}

@router.post("/refresh", response_model=Token)
async def refresh_token(
    schema: RefreshTokenRequest,
    db: AsyncSession = Depends(get_async_db),
    redis: aioredis.Redis = Depends(get_redis)
) -> Any:
    payload = verify_token(schema.refresh_token)
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")
        
    user_id_str = payload.get("sub")
    if not user_id_str:
         raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")

    # Generate new access token
    new_access_token = create_access_token(user_id_str)
    return {
        "access_token": new_access_token,
        "refresh_token": schema.refresh_token,
        "token_type": "bearer"
    }

@router.post("/verify-otp")
async def verify_otp(
    schema: OTPVerifyRequest,
    db: AsyncSession = Depends(get_async_db),
    redis: aioredis.Redis = Depends(get_redis)
) -> Any:
    auth_service = AuthService(db, redis)
    is_valid = await auth_service.verify_otp(schema.mobile_or_email, schema.otp_code, schema.purpose)
    if not is_valid:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="OTP is invalid or has expired")
    return {"detail": "OTP verified successfully"}

@router.post("/resend-otp")
async def resend_otp(
    schema: OTPResendRequest,
    db: AsyncSession = Depends(get_async_db),
    redis: aioredis.Redis = Depends(get_redis)
) -> Any:
    auth_service = AuthService(db, redis)
    otp_code = await auth_service.generate_otp(schema.mobile_or_email, schema.purpose)
    
    # In sandbox we return the code to verify directly
    return {
        "detail": "OTP resent successfully",
        "otp_sandbox_hint": otp_code
    }

@router.post("/forgot-password")
async def forgot_password(
    schema: ForgotPasswordRequest,
    db: AsyncSession = Depends(get_async_db),
    redis: aioredis.Redis = Depends(get_redis)
) -> Any:
    auth_service = AuthService(db, redis)
    otp_code = await auth_service.generate_otp(schema.mobile_or_email, "reset_password")
    return {
        "detail": "Password reset OTP sent successfully",
        "otp_sandbox_hint": otp_code
    }

@router.post("/reset-password")
async def reset_password(
    schema: ResetPasswordRequest,
    db: AsyncSession = Depends(get_async_db),
    redis: aioredis.Redis = Depends(get_redis)
) -> Any:
    auth_service = AuthService(db, redis)
    is_valid = await auth_service.verify_otp(schema.mobile_or_email, schema.otp_code, "reset_password")
    if not is_valid:
         raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="OTP is invalid or has expired")

    # Change user password
    from app.repositories.user_repository import UserRepository
    user_repo = UserRepository(db)
    user = await user_repo.get_by_mobile(schema.mobile_or_email)
    if not user:
        user = await user_repo.get_by_email(schema.mobile_or_email)
        
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User account not found")

    from app.core.security import get_password_hash
    user.password_hash = get_password_hash(schema.new_password)
    await db.commit()

    return {"detail": "Password reset successfully"}
