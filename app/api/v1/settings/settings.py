from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Any

from app.core.database import get_async_db
from app.core.deps import get_current_user

router = APIRouter()

@router.get("/")
async def get_user_settings(
    current_user = Depends(get_current_user)
) -> Any:
    # Simulated settings store (stored on profile or defaults)
    return {
        "user_id": current_user.id,
        "language": "en",
        "sound_enabled": True,
        "email_notifications": True,
        "sms_notifications": False,
        "push_notifications": True,
        "security_two_factor": False
    }

@router.put("/")
async def update_user_settings(
    payload: dict,
    current_user = Depends(get_current_user)
) -> Any:
    # Mock settings updates
    return {
        "message": "Preferences updated successfully",
        "updated_settings": payload
    }
