import asyncio
import sys
import os
from pprint import pprint

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.database import SessionLocal
from app.services.rebate_service import RebateService

async def test():
    async with SessionLocal() as db:
        srv = RebateService(db)
        # Assuming user 1 exists, change to fetch a valid user ID first
        from app.models.users import User
        from sqlalchemy import select
        
        user = await db.scalar(select(User).limit(1))
        if not user:
            print("No users found")
            return
            
        print(f"Testing for user_id={user.id}")
        try:
            res = await srv.get_dashboard(user.id)
            pprint(res.model_dump())
        except Exception as e:
            import traceback
            traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test())
