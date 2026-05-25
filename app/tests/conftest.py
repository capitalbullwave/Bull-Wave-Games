import asyncio
import pytest
from typing import AsyncGenerator, Generator, Any
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import app
from app.core.database import Base, get_async_db
from app.core.deps import get_redis

# Async in-memory SQLite for high-speed local unit testing
TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"

engine = create_async_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = async_sessionmaker(
    bind=engine, class_=AsyncSession, expire_on_commit=False
)

@pytest.fixture(scope="session")
def event_loop() -> Generator:
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()

@pytest.fixture(scope="session", autouse=True)
async def setup_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)

@pytest.fixture
async def db_session() -> AsyncGenerator[AsyncSession, None]:
    async with TestingSessionLocal() as session:
        yield session
        await session.rollback()
        await session.close()

# Mock Redis
class MockRedis:
    def __init__(self):
        self.store = {}

    async def get(self, key: str):
        return self.store.get(key)

    async def set(self, key: str, value: Any, ex: int = None):
        self.store[key] = value
        return True

    async def delete(self, key: str):
        if key in self.store:
            del self.store[key]
        return True

    async def incr(self, key: str):
        val = int(self.store.get(key, 0)) + 1
        self.store[key] = str(val)
        return val

    async def expire(self, key: str, time: int):
        return True

    async def close(self):
        pass

@pytest.fixture
async def client(db_session: AsyncSession) -> AsyncGenerator[AsyncClient, None]:
    # Override get_async_db dependency
    async def override_get_db():
        yield db_session

    mock_redis = MockRedis()
    async def override_get_redis():
        yield mock_redis

    app.dependency_overrides[get_async_db] = override_get_db
    app.dependency_overrides[get_redis] = override_get_redis

    async with AsyncClient(
        transport=ASGIAutransport(app=app),
        base_url="http://test"
    ) as ac:
        yield ac

    app.dependency_overrides.clear()
