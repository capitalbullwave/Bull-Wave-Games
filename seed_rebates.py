import asyncio
import sys
import os

# Add the project root to python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.database import SessionLocal
from app.models.rebates import RebateCategory
from sqlalchemy import select

categories = [
    {"name": "Lottery", "code": "lottery"},
    {"name": "Casino", "code": "casino"},
    {"name": "Sports", "code": "sports"},
    {"name": "Rummy", "code": "rummy"},
    {"name": "Slots", "code": "slots"},
    {"name": "Fishing", "code": "fishing"}
]

async def seed_categories():
    print("Seeding Rebate Categories...")
    async with SessionLocal() as db:
        for data in categories:
            result = await db.execute(select(RebateCategory).where(RebateCategory.code == data["code"]))
            existing = result.scalars().first()
            if not existing:
                cat = RebateCategory(**data)
                db.add(cat)
                print(f"Added {data['name']}")
            else:
                print(f"{data['name']} already exists")
        await db.commit()
    print("Category seeding complete!")

if __name__ == "__main__":
    asyncio.run(seed_categories())
