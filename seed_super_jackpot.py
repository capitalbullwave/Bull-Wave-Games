import asyncio
import os
from datetime import datetime, timedelta
from app.core.database import SessionLocal
from app.models.super_jackpots import UserSuperJackpot
from app.models.users import User
from sqlalchemy import select

async def seed_super_jackpots():
    async with SessionLocal() as db:
        # Get the first user
        result = await db.execute(select(User).limit(1))
        user = result.scalars().first()
        
        if not user:
            print("No users found to seed.")
            return

        print(f"Adding Super Jackpots to User ID: {user.id}")

        jackpot1 = UserSuperJackpot(
            user_id=user.id,
            amount=500.0,
            expires_at=datetime.now() + timedelta(days=3)
        )
        
        jackpot2 = UserSuperJackpot(
            user_id=user.id,
            amount=1250.0,
            expires_at=datetime.now() + timedelta(days=2)
        )

        db.add(jackpot1)
        db.add(jackpot2)
        await db.commit()

        print(f"Successfully added 2 jackpots (total 1750) to user {user.id}")

if __name__ == "__main__":
    asyncio.run(seed_super_jackpots())
