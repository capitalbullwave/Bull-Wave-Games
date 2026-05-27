from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Any, List

from app.core.database import get_async_db
from app.core.deps import get_current_user
from app.models.wallets import WalletTransaction, Deposit, Withdrawal
from app.models.games import Bet
from app.models.referrals import ReferralCommission
from app.models.rewards import Reward
from app.schemas.wallet import WalletTransactionResponse, DepositResponse, WithdrawalResponse
from app.schemas.games import BetResponse
from app.schemas.others import CommissionResponse, RewardResponse

router = APIRouter()

@router.get("/wallet", response_model=List[WalletTransactionResponse])
async def get_wallet_history(
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db)
) -> Any:
    from app.services.wallet_service import WalletService
    wallet_srv = WalletService(db)
    balances = await wallet_srv.get_balances(current_user.id)
    
    query = select(WalletTransaction).where(WalletTransaction.wallet_id == balances.id).order_by(WalletTransaction.created_at.desc())
    result = await db.execute(query)
    return list(result.scalars().all())

@router.get("/games", response_model=List[BetResponse])
async def get_betting_history(
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db)
) -> Any:
    query = select(Bet).where(Bet.user_id == current_user.id).order_by(Bet.created_at.desc())
    result = await db.execute(query)
    return list(result.scalars().all())

@router.get("/deposits", response_model=List[DepositResponse])
async def get_deposit_history(
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db)
) -> Any:
    query = select(Deposit).where(Deposit.user_id == current_user.id).order_by(Deposit.created_at.desc())
    result = await db.execute(query)
    return list(result.scalars().all())

@router.get("/withdrawals", response_model=List[WithdrawalResponse])
async def get_withdrawal_history(
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db)
) -> Any:
    query = select(Withdrawal).where(Withdrawal.user_id == current_user.id).order_by(Withdrawal.created_at.desc())
    result = await db.execute(query)
    return list(result.scalars().all())

@router.get("/referrals", response_model=List[CommissionResponse])
async def get_referral_history(
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db)
) -> Any:
    from app.models.users import User
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

@router.get("/rewards", response_model=List[RewardResponse])
async def get_rewards_history(
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db)
) -> Any:
    query = select(Reward).where(Reward.user_id == current_user.id).order_by(Reward.created_at.desc())
    result = await db.execute(query)
    return list(result.scalars().all())
