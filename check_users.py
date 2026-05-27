import asyncio
import os
import sys

# Add the current directory to sys.path so we can import from app
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import select, text
from app.core.config import settings

async def main():
    try:
        engine = create_async_engine(settings.DATABASE_URL, echo=False)
        async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
        
        async with async_session() as session:
            result = await session.execute(text("SELECT id, username, email, mobile FROM users;"))
            users = result.fetchall()
            
            if not users:
                print("\n==== DATABASE USERS ====")
                print("No users found in the database. The table is completely empty.")
                print("========================")
            else:
                print("\n==== DATABASE USERS ====")
                for user in users:
                    print(f"ID: {user[0]}, Username: {user[1]}, Email: {user[2]}, Mobile: {user[3]}")
                print("========================")
                
    except Exception as e:
        print(f"Error querying database: {e}")

if __name__ == "__main__":
    asyncio.run(main())
