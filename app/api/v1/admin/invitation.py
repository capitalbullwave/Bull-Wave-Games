from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import List

from app.core.database import get_async_db
from app.core.deps import get_current_user
from app.models.users import User
from app.models.invitations import InvitationBonusLevel, UserInvitationProgress, InvitationRewardHistory
from app.schemas.responses import BaseResponse, success_response, error_response
from app.schemas.invitations import (
    InvitationBonusLevelCreate,
    InvitationBonusLevelUpdate,
    InvitationBonusLevelResponse,
    InvitationStatsResponse
)

router = APIRouter()

def get_admin_user(current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have enough permissions"
        )
    return current_user

@router.post("/create", response_model=BaseResponse[InvitationBonusLevelResponse])
async def create_bonus_level(
    data_in: InvitationBonusLevelCreate,
    current_user: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_async_db)
):
    """Admin: Create a new invitation bonus level."""
    level = InvitationBonusLevel(**data_in.model_dump())
    db.add(level)
    try:
        await db.commit()
        await db.refresh(level)
        return success_response(data=level, message="Level created successfully")
    except Exception as e:
        await db.rollback()
        return error_response(message=str(e))

@router.put("/{level_id}", response_model=BaseResponse[InvitationBonusLevelResponse])
async def update_bonus_level(
    level_id: int,
    data_in: InvitationBonusLevelUpdate,
    current_user: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_async_db)
):
    """Admin: Update an invitation bonus level."""
    result = await db.execute(select(InvitationBonusLevel).where(InvitationBonusLevel.id == level_id))
    level = result.scalars().first()
    
    if not level:
        return error_response(message="Level not found")
        
    update_data = data_in.model_dump(exclude_unset=True)
    for k, v in update_data.items():
        setattr(level, k, v)
        
    await db.commit()
    await db.refresh(level)
    return success_response(data=level, message="Level updated successfully")

@router.delete("/{level_id}", response_model=BaseResponse[None])
async def delete_bonus_level(
    level_id: int,
    current_user: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_async_db)
):
    """Admin: Delete an invitation bonus level."""
    result = await db.execute(select(InvitationBonusLevel).where(InvitationBonusLevel.id == level_id))
    level = result.scalars().first()
    
    if not level:
        return error_response(message="Level not found")
        
    await db.delete(level)
    await db.commit()
    return success_response(message="Level deleted successfully")

@router.get("/list", response_model=BaseResponse[List[InvitationBonusLevelResponse]])
async def list_bonus_levels(
    current_user: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_async_db)
):
    """Admin: Get all invitation bonus levels."""
    result = await db.execute(select(InvitationBonusLevel).order_by(InvitationBonusLevel.level.asc()))
    levels = result.scalars().all()
    return success_response(data=list(levels))

@router.get("/stats", response_model=BaseResponse[InvitationStatsResponse])
async def get_invitation_stats(
    current_user: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_async_db)
):
    """Admin: Get global invitation statistics."""
    from app.models.referrals import Referral
    
    # Total invites
    res_invites = await db.execute(select(func.count(Referral.id)))
    total_invites = res_invites.scalar() or 0
    
    # Total completed deposits (from referrals)
    res_deposits = await db.execute(select(func.count(Referral.id)).where(Referral.first_deposit_completed == True))
    total_completed_deposits = res_deposits.scalar() or 0
    
    # Total rewards claimed
    res_rewards = await db.execute(select(func.sum(InvitationRewardHistory.amount)))
    total_rewards_claimed = res_rewards.scalar() or 0.0
    
    return success_response(data={
        "total_invites": total_invites,
        "total_completed_deposits": total_completed_deposits,
        "total_rewards_claimed": float(total_rewards_claimed)
    })
