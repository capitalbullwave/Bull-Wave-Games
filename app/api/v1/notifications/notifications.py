from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_, update
from typing import Any, List

from app.core.database import get_async_db
from app.core.deps import get_current_user
from app.schemas.others import NotificationResponse
from app.models.notifications import Notification

router = APIRouter()

@router.get("/list", response_model=List[NotificationResponse])
async def list_notifications(
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db)
) -> Any:
    # Pull user-specific notifications or global broadcasts (where user_id is null)
    query = (
        select(Notification)
        .where(or_(Notification.user_id == current_user.id, Notification.user_id == None))
        .order_by(Notification.created_at.desc())
    )
    result = await db.execute(query)
    return list(result.scalars().all())

@router.post("/read-all", status_code=status.HTTP_200_OK)
async def read_all_notifications(
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db)
) -> Any:
    query = (
        update(Notification)
        .where(Notification.user_id == current_user.id, Notification.is_read == False)
        .values(is_read=True)
    )
    await db.execute(query)
    await db.commit()
    return {"detail": "All notifications marked as read"}

@router.post("/read/{notification_id}", status_code=status.HTTP_200_OK)
async def read_notification(
    notification_id: int,
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db)
) -> Any:
    query = select(Notification).where(Notification.id == notification_id, Notification.user_id == current_user.id)
    result = await db.execute(query)
    notif = result.scalars().first()
    if not notif:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Notification not found")
        
    notif.is_read = True
    await db.commit()
    return {"detail": "Notification marked as read"}
