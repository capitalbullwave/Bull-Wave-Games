from typing import AsyncGenerator, Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import redis.asyncio as aioredis
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.core.config import settings
from app.core.database import get_async_db
from app.core.security import verify_token
from typing import Any
import time

# Bearer token helper
security_bearer = HTTPBearer(auto_error=False)

# Thread-safe in-memory Redis fallback cache for systems where Redis is down
class InMemoryRedisFallback:
    def __init__(self):
        self._data = {}
        self._expires = {}

    def _is_expired(self, key):
        if key in self._expires:
            expire_at = self._expires[key]
            if expire_at is not None and time.time() > expire_at:
                self._data.pop(key, None)
                self._expires.pop(key, None)
                return True
        return False

    async def get(self, key: str):
        if self._is_expired(key):
            return None
        return self._data.get(key)

    async def set(self, key: str, value: Any, ex: int = None):
        self._data[key] = str(value)
        if ex is not None:
            self._expires[key] = time.time() + ex
        else:
            self._expires.pop(key, None)
        return True

    async def delete(self, key: str):
        self._data.pop(key, None)
        self._expires.pop(key, None)
        return True

    async def incr(self, key: str):
        if self._is_expired(key):
            self._data[key] = "0"
        val = int(self._data.get(key, 0)) + 1
        self._data[key] = str(val)
        return val

    async def expire(self, key: str, seconds: int):
        if key in self._data:
            self._expires[key] = time.time() + seconds
            return True
        return False

class SafeRedisWrapper:
    _fallback_store = InMemoryRedisFallback()

    def __init__(self, real_redis):
        self.real_redis = real_redis

    async def get(self, key):
        try:
            return await self.real_redis.get(key)
        except Exception:
            return await self._fallback_store.get(key)

    async def set(self, key, value, ex=None):
        try:
            return await self.real_redis.set(key, value, ex=ex)
        except Exception:
            return await self._fallback_store.set(key, value, ex=ex)

    async def delete(self, key):
        try:
            return await self.real_redis.delete(key)
        except Exception:
            return await self._fallback_store.delete(key)

    async def incr(self, key):
        try:
            return await self.real_redis.incr(key)
        except Exception:
            return await self._fallback_store.incr(key)

    async def expire(self, key, seconds):
        try:
            return await self.real_redis.expire(key, seconds)
        except Exception:
            return await self._fallback_store.expire(key, seconds)

    async def close(self):
        try:
            await self.real_redis.close()
        except Exception:
            pass

# Shared Redis pool client
_redis_pool: Optional[aioredis.ConnectionPool] = None

def get_redis_pool() -> aioredis.ConnectionPool:
    global _redis_pool
    if _redis_pool is None:
        _redis_pool = aioredis.ConnectionPool.from_url(
            settings.REDIS_URL,
            decode_responses=True,
            socket_connect_timeout=1.0,
            socket_timeout=1.0
        )
    return _redis_pool

async def get_redis() -> AsyncGenerator[Any, None]:
    pool = get_redis_pool()
    client = aioredis.Redis(connection_pool=pool)
    wrapped_client = SafeRedisWrapper(client)
    try:
        yield wrapped_client
    finally:
        await wrapped_client.close()

async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_bearer),
    db: AsyncSession = Depends(get_async_db),
    redis_client: aioredis.Redis = Depends(get_redis)
):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    if not credentials:
        raise credentials_exception
        
    token = credentials.credentials
    payload = verify_token(token)
    if not payload or payload.get("type") != "access":
        raise credentials_exception
        
    user_id_str = payload.get("sub")
    if not user_id_str:
        raise credentials_exception
        
    # Check if token is blacklisted in Redis
    is_blacklisted = await redis_client.get(f"blacklist:{token}")
    if is_blacklisted:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session has expired or logged out"
        )
        
    # Lazy import to avoid circular dependency
    from app.models.users import User
    
    # Query current user
    result = await db.execute(select(User).where(User.id == int(user_id_str)))
    user = result.scalars().first()
    if not user:
        raise credentials_exception
        
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User account is deactivated"
        )
        
    return user

async def get_current_admin(
    current_user = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="The user does not have enough privileges"
        )
    return current_user
