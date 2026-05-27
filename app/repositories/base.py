from typing import Any, Dict, Generic, List, Optional, Type, TypeVar, Union
from sqlalchemy import select, update, delete
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import Base

ModelType = TypeVar("ModelType", bound=Base)

class BaseRepository(Generic[ModelType]):
    def __init__(self, model: Type[ModelType], db: AsyncSession):
        self.model = model
        self.db = db

    async def get(self, id: Any) -> Optional[ModelType]:
        query = select(self.model).where(self.model.id == id)
        result = await self.db.execute(query)
        return result.scalars().first()

    async def get_multi(self, *, skip: int = 0, limit: int = 100) -> List[ModelType]:
        query = select(self.model).offset(skip).limit(limit)
        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def create(self, obj_in_data: Dict[str, Any]) -> ModelType:
        db_obj = self.model(**obj_in_data)
        self.db.add(db_obj)
        await self.db.flush()  # Flushes to get ID but doesn't commit yet
        return db_obj

    async def update(self, db_obj: ModelType, obj_in_data: Dict[str, Any]) -> ModelType:
        for field, value in obj_in_data.items():
            if hasattr(db_obj, field):
                setattr(db_obj, field, value)
        self.db.add(db_obj)
        await self.db.flush()
        return db_obj

    async def remove(self, id: Any) -> Optional[ModelType]:
        db_obj = await self.get(id)
        if db_obj:
            await self.db.delete(db_obj)
            await self.db.flush()
        return db_obj
