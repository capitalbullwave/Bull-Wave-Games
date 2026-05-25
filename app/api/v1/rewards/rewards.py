from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Any, List

from app.core.database import get_async_db
from app.core.deps import get_current_user
from app.schemas.others import RewardResponse, CouponClaimRequest
from app.services.rewards_and_vip_service import RewardsAndVIPService
from app.models.rewards import Reward

router = APIRouter()

@router.post("/daily-checkin", response_model=RewardResponse)
async def claim_daily_checkin(
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db)
) -> Any:
    rewards_srv = RewardsAndVIPService(db)
    reward = await rewards_srv.claim_daily_checkin(current_user.id)
    await db.commit()
    return reward

@router.post("/claim-coupon", response_model=RewardResponse)
async def claim_coupon(
    schema: CouponClaimRequest,
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db)
) -> Any:
    rewards_srv = RewardsAndVIPService(db)
    reward = await rewards_srv.claim_coupon(current_user.id, schema.code)
    await db.commit()
    return reward

@router.post("/spin-wheel")
async def spin_wheel(
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db)
) -> Any:
    rewards_srv = RewardsAndVIPService(db)
    prize = await rewards_srv.spin_wheel(current_user.id)
    await db.commit()
    return {
        "detail": "Lucky Wheel spin completed",
        "prize_amount": prize,
        "wallet_credited": "bonus" if prize > 0 else None
    }

@router.get("/history", response_model=List[RewardResponse])
async def list_rewards_history(
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db)
) -> Any:
    query = select(Reward).where(Reward.user_id == current_user.id).order_by(Reward.created_at.desc())
    result = await db.execute(query)
    return list(result.scalars().all())
