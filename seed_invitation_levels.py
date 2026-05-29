import asyncio
import sys
import os

# Add the project root to python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.database import SessionLocal
from app.models.invitations import InvitationBonusLevel

levels_data = [
    {"level": 1, "required_invites": 1, "required_deposit_amount": 500, "reward_amount": 55},
    {"level": 2, "required_invites": 3, "required_deposit_amount": 500, "reward_amount": 155},
    {"level": 3, "required_invites": 10, "required_deposit_amount": 500, "reward_amount": 555},
    {"level": 4, "required_invites": 30, "required_deposit_amount": 500, "reward_amount": 1555},
    {"level": 5, "required_invites": 50, "required_deposit_amount": 500, "reward_amount": 2555},
    {"level": 6, "required_invites": 70, "required_deposit_amount": 500, "reward_amount": 3355},
    {"level": 7, "required_invites": 100, "required_deposit_amount": 500, "reward_amount": 5555},
    {"level": 8, "required_invites": 200, "required_deposit_amount": 500, "reward_amount": 10955},
    {"level": 9, "required_invites": 500, "required_deposit_amount": 500, "reward_amount": 25555},
    {"level": 10, "required_invites": 1000, "required_deposit_amount": 500, "reward_amount": 48555},
    {"level": 11, "required_invites": 5000, "required_deposit_amount": 500, "reward_amount": 355555},
    {"level": 12, "required_invites": 10000, "required_deposit_amount": 500, "reward_amount": 755555},
    {"level": 13, "required_invites": 20000, "required_deposit_amount": 500, "reward_amount": 1555555},
    {"level": 14, "required_invites": 50000, "required_deposit_amount": 500, "reward_amount": 3555555},
    {"level": 15, "required_invites": 100000, "required_deposit_amount": 500, "reward_amount": 7555555},
]

async def seed_levels():
    print("Seeding Invitation Bonus Levels...")
    async with SessionLocal() as db:
        for data in levels_data:
            # Check if exists
            from sqlalchemy import select
            result = await db.execute(select(InvitationBonusLevel).where(InvitationBonusLevel.level == data["level"]))
            existing = result.scalars().first()
            if not existing:
                lvl = InvitationBonusLevel(**data)
                db.add(lvl)
                print(f"Added Level {data['level']}")
            else:
                print(f"Level {data['level']} already exists, skipping.")
        await db.commit()
    print("Seeding complete!")

if __name__ == "__main__":
    asyncio.run(seed_levels())
