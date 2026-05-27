import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy import text

async def main():
    engine = create_async_engine('sqlite+aiosqlite:///./bullwave.db')
    async with AsyncSession(engine) as session:
        result = await session.execute(text('SELECT * FROM wallets'))
        print(result.mappings().all())

asyncio.run(main())
