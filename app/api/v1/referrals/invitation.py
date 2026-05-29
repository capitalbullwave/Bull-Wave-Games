from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from app.core.database import get_async_db
from app.core.deps import get_current_user
from app.models.users import User
from app.schemas.responses import BaseResponse, success_response, error_response
from app.schemas.invitations import (
    InvitationBonusLevelResponse,
    UserInvitationProgressResponse,
    InvitationRewardHistoryResponse,
    ReferralLinkResponse,
    ClaimRewardResponse
)
from app.services.invitation_service import InvitationService

router = APIRouter()

@router.get("/bonus-levels", response_model=BaseResponse[List[InvitationBonusLevelResponse]])
async def get_bonus_levels(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db)
):
    """Get all invitation bonus levels."""
    srv = InvitationService(db)
    levels = await srv.get_all_levels()
    return success_response(data=levels)

@router.get("/progress", response_model=BaseResponse[List[UserInvitationProgressResponse]])
async def get_invitation_progress(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db)
):
    """Get current user's progress for all invitation levels."""
    srv = InvitationService(db)
    progress = await srv.get_user_progress(current_user.id)
    return success_response(data=progress)

@router.get("/history", response_model=BaseResponse[List[InvitationRewardHistoryResponse]])
async def get_reward_history(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db)
):
    """Get user's invitation reward history."""
    srv = InvitationService(db)
    history = await srv.get_user_history(current_user.id)
    return success_response(data=history)

@router.get("/referral-link", response_model=BaseResponse[ReferralLinkResponse])
async def get_referral_link(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db)
):
    """Get user's referral code and link."""
    ref_code = current_user.referral_code
    return success_response(data={
        "referralCode": ref_code,
        "referralLink": f"https://bullwavegames.com/register?ref={ref_code}"
    })

@router.post("/claim/{level_id}", response_model=BaseResponse[ClaimRewardResponse])
async def claim_invitation_reward(
    level_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db)
):
    """Claim reward for a specific level if unlocked."""
    srv = InvitationService(db)
    try:
        amount = await srv.claim_reward(current_user.id, level_id)
        await db.commit()
        return success_response(
            data={"success": True, "message": "Reward claimed successfully", "amount": amount},
            message="Reward claimed successfully"
        )
    except ValueError as e:
        await db.rollback()
        return error_response(message=str(e))
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
