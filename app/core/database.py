from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from app.core.config import settings

# Monkey-patch SQLAlchemy's DateTime class to automatically normalize 
# timezone-aware datetimes to naive UTC datetimes before asyncpg gets them.
import sqlalchemy
from sqlalchemy.types import TypeDecorator, DateTime as SQLDateTime
from datetime import datetime, timezone

class SafeDateTime(SQLDateTime):
    def bind_processor(self, dialect):
        orig_processor = super().bind_processor(dialect)
        def process(value):
            if value is not None:
                if isinstance(value, datetime) and value.tzinfo is not None:
                    value = value.astimezone(timezone.utc).replace(tzinfo=None)
            if orig_processor:
                return orig_processor(value)
            return value
        return process

    def result_processor(self, dialect, coltype):
        orig_processor = super().result_processor(dialect, coltype)
        def process(value):
            if orig_processor:
                value = orig_processor(value)
            if value is not None:
                return value.replace(tzinfo=timezone.utc)
            return value
        return process

# Bind to all relevant SQLAlchemy module entrypoints
sqlalchemy.DateTime = SafeDateTime
sqlalchemy.types.DateTime = SafeDateTime
sqlalchemy.sql.sqltypes.DateTime = SafeDateTime

# Create async engine with robust pool configuration
engine = create_async_engine(
    settings.DATABASE_URL,
    echo=False,
    pool_pre_ping=True,
    pool_size=20,
    max_overflow=10
)

# AsyncSession factory
SessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    autocommit=False,
    autoflush=False,
    expire_on_commit=False
)

# Base class for all models
class Base(DeclarativeBase):
    pass

# DB dependency to yield session asynchronously
async def get_async_db() -> AsyncGenerator[AsyncSession, None]:
    async with SessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()
