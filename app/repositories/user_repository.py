from typing import Optional, Dict, Any
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.base import BaseRepository
from app.models.users import User, Profile, KYCRecord, UserSession
from app.models.wallets import Wallet

class UserRepository(BaseRepository[User]):
    def __init__(self, db: AsyncSession):
        super().__init__(User, db)

    async def get_by_email(self, email: str) -> Optional[User]:
        query = select(User).where(User.email == email)
        result = await self.db.execute(query)
        return result.scalars().first()

    async def get_by_username(self, username: str) -> Optional[User]:
        query = select(User).where(User.username == username)
        result = await self.db.execute(query)
        return result.scalars().first()

    async def get_by_mobile(self, mobile: str) -> Optional[User]:
        query = select(User).where(User.mobile == mobile)
        result = await self.db.execute(query)
        return result.scalars().first()

    async def get_by_referral_code(self, referral_code: str) -> Optional[User]:
        query = select(User).where(User.referral_code == referral_code)
        result = await self.db.execute(query)
        return result.scalars().first()

    async def create_user_with_wallet(
        self, user_data: Dict[str, Any], profile_data: Dict[str, Any]
    ) -> User:
        # 1. Create User
        user = User(**user_data)
        self.db.add(user)
        await self.db.flush()  # Populates user.id
        
        # 2. Create Profile linked to User
        profile = Profile(user_id=user.id, **profile_data)
        self.db.add(profile)
        
        # 3. Create Default Wallet linked to User
        wallet = Wallet(
            user_id=user.id,
            main_balance=0.00,
            bonus_balance=0.00,
            winning_balance=0.00,
            referral_balance=0.00
        )
        self.db.add(wallet)
        
        # 4. Create Empty pending KYC Record
        kyc = KYCRecord(user_id=user.id, status="pending")
        self.db.add(kyc)
        
        await self.db.flush()
        
        # Eagerly load relationships to prevent lazy-loading / MissingGreenlet errors
        query = select(User).where(User.id == user.id).options(
            selectinload(User.profile),
            selectinload(User.kyc),
            selectinload(User.wallet)
        )
        result = await self.db.execute(query)
        return result.scalars().first()

    async def create_session(
        self, user_id: int, token: str, ip_address: Optional[str], user_agent: Optional[str]
    ) -> UserSession:
        session = UserSession(
            user_id=user_id,
            token=token,
            ip_address=ip_address,
            user_agent=user_agent,
            is_active=True
        )
        self.db.add(session)
        await self.db.flush()
        return session

    async def invalidate_all_sessions(self, user_id: int):
        from sqlalchemy import update
        query = update(UserSession).where(
            UserSession.user_id == user_id,
            UserSession.is_active == True
        ).values(is_active=False)
        await self.db.execute(query)
