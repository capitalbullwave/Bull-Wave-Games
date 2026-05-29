from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from app.core.database import get_async_db
from app.core.deps import get_current_user
from app.models.users import User
from app.schemas.responses import BaseResponse, success_response, error_response
from app.schemas.activities import ActivityListResponse, ActivityProgressResponse, ActivityRewardHistoryResponse
from app.services.activity_service import ActivityService

router = APIRouter()

@router.get("/list", response_model=BaseResponse[ActivityListResponse])
async def list_user_activities(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db)
):
    """User: Get list of activities with their progress and bonuses."""
    srv = ActivityService(db)
    res = await srv.get_user_activities(current_user.id)
    return success_response(data=res)

@router.post("/claim/{task_id}", response_model=BaseResponse[None])
async def claim_activity_reward(
    task_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db)
):
    """User: Claim reward for a completed activity."""
    srv = ActivityService(db)
    await srv.claim_reward(current_user.id, task_id)
    return success_response(message="Reward claimed successfully! Funds added to wallet.")

@router.get("/history", response_model=BaseResponse[List[ActivityRewardHistoryResponse]])
async def get_activity_history(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db)
):
    """User: Get history of claimed activity rewards."""
    from sqlalchemy import select
    from app.models.activities import ActivityRewardHistory, ActivityTask
    
    query = (
        select(ActivityRewardHistory, ActivityTask.title)
        .join(ActivityTask, ActivityRewardHistory.task_id == ActivityTask.id)
        .where(ActivityRewardHistory.user_id == current_user.id)
        .order_by(ActivityRewardHistory.claimed_at.desc())
    )
    result = await db.execute(query)
    rows = result.all()
    
    data = []
    for hist, title in rows:
        data.append(ActivityRewardHistoryResponse(
            id=hist.id,
            task_id=hist.task_id,
            title=title,
            reward_amount=hist.reward_amount,
            claimed_at=hist.claimed_at
        ))
        
    return success_response(data=data)
