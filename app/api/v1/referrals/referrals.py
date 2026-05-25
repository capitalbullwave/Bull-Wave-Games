from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Any, List

from app.core.database import get_async_db
from app.core.deps import get_current_user
from app.schemas.others import ReferralResponse, CommissionResponse
from app.services.referral_service import ReferralService
from app.models.referrals import ReferralCommission
from app.models.users import User

router = APIRouter()

@router.get("/summary", response_model=ReferralResponse)
async def get_referral_summary(
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db)
) -> Any:
    ref_srv = ReferralService(db)
    summary = await ref_srv.get_referral_summary(current_user.id)
    return summary

@router.get("/commissions", response_model=List[CommissionResponse])
async def list_commissions(
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db)
) -> Any:
    # Query commissions earned by current user
    # Join referee user to pull referee username
    query = (
        select(ReferralCommission, User.username)
        .join(User, ReferralCommission.referee_id == User.id)
        .where(ReferralCommission.referrer_id == current_user.id)
        .order_by(ReferralCommission.created_at.desc())
    )
    result = await db.execute(query)
    
    commissions = []
    for row in result.all():
        comm, username = row
        commissions.append({
            "id": comm.id,
            "referee_username": username,
            "commission_amount": float(comm.commission_amount),
            "level": comm.level,
            "status": comm.status,
            "created_at": comm.created_at
        })
        
    return commissions
