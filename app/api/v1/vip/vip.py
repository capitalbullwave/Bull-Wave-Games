from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import Any, List

from app.core.database import get_async_db
from app.core.deps import get_current_user
from app.schemas.others import VIPLevelResponse
from app.models.vip_and_audit import VIPLevel
from app.models.wallets import Deposit
from app.models.games import Bet

router = APIRouter()

@router.get("/levels", response_model=List[VIPLevelResponse])
async def list_vip_levels(
    db: AsyncSession = Depends(get_async_db)
) -> Any:
    query = select(VIPLevel).order_by(VIPLevel.level_number.asc())
    result = await db.execute(query)
    levels = list(result.scalars().all())
    
    # If database is empty, seed mock levels
    if not levels:
        levels = [
            VIPLevel(id=1, level_name="Bronze", level_number=0, min_wager=0, min_deposit=0, daily_withdrawal_limit=50000, monthly_bonus=0, referral_bonus_rate=1.0),
            VIPLevel(id=2, level_name="Silver", level_number=1, min_wager=50000, min_deposit=5000, daily_withdrawal_limit=100000, monthly_bonus=500, referral_bonus_rate=1.05),
            VIPLevel(id=3, level_name="Gold", level_number=2, min_wager=200000, min_deposit=20000, daily_withdrawal_limit=300000, monthly_bonus=2000, referral_bonus_rate=1.10),
            VIPLevel(id=4, level_name="Platinum", level_number=3, min_wager=1000000, min_deposit=100000, daily_withdrawal_limit=1000000, monthly_bonus=10000, referral_bonus_rate=1.20)
        ]
    return levels

@router.get("/my-status")
async def get_vip_status(
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db)
) -> Any:
    # 1. Total wagers
    q_bet = select(func.sum(Bet.bet_amount)).where(Bet.user_id == current_user.id)
    r_bet = await db.execute(q_bet)
    tot_wager = float(r_bet.scalar() or 0.0)

    # 2. Total deposits
    q_dep = select(func.sum(Deposit.amount)).where(Deposit.user_id == current_user.id, Deposit.status == "completed")
    r_dep = await db.execute(q_dep)
    tot_deposit = float(r_dep.scalar() or 0.0)

    # 3. Current VIP details
    current_vip = None
    if current_user.vip_level_id:
        current_vip = await db.get(VIPLevel, current_user.vip_level_id)
        
    if not current_vip:
        # Default mock bronze
        current_vip = VIPLevel(level_name="Bronze", level_number=0, min_wager=0, min_deposit=0, daily_withdrawal_limit=50000)

    # 4. Next level target
    q_next = select(VIPLevel).where(VIPLevel.level_number > current_vip.level_number).order_by(VIPLevel.level_number.asc()).limit(1)
    r_next = await db.execute(q_next)
    next_vip = r_next.scalars().first()

    return {
        "current_vip_level": current_vip.level_name,
        "lifetime_wagered": tot_wager,
        "lifetime_deposited": tot_deposit,
        "withdrawal_limit_daily": float(current_vip.daily_withdrawal_limit),
        "next_vip_level": next_vip.level_name if next_vip else "Max Level",
        "wager_required_for_next": float(next_vip.min_wager) - tot_wager if next_vip else 0.0,
        "deposit_required_for_next": float(next_vip.min_deposit) - tot_deposit if next_vip else 0.0
    }
