from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import Any
from datetime import datetime
from decimal import Decimal

from app.core.deps import get_async_db, get_current_user
from app.models.users import User
from app.models.wallets import Deposit, Withdrawal, Wallet
from app.models.first_gift import FirstGiftClaim
from app.schemas.first_gift import FirstGiftStatusResponse, FirstGiftClaimResponse
from app.services.wallet_service import WalletService

router = APIRouter()

@router.get("/status", response_model=FirstGiftStatusResponse)
async def get_first_gift_status(
    db: AsyncSession = Depends(get_async_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Get the user's first gift eligibility status.
    """
    # Check if already claimed
    claim_query = select(FirstGiftClaim).where(FirstGiftClaim.user_id == current_user.id)
    claim_result = await db.execute(claim_query)
    claimed = claim_result.scalars().first()
    
    if claimed:
        return FirstGiftStatusResponse(
            has_deposit=True,
            first_deposit_amount=0.0, # Not needed if already claimed
            potential_bonus=claimed.amount_claimed,
            is_eligible=False,
            is_claimed=True,
            message="You have already claimed your First Gift bonus."
        )

    # Find the oldest completed deposit
    deposit_query = select(Deposit).where(
        Deposit.user_id == current_user.id,
        Deposit.status == "completed"
    ).order_by(Deposit.created_at.asc()).limit(1)
    
    deposit_result = await db.execute(deposit_query)
    first_deposit = deposit_result.scalars().first()

    if not first_deposit:
        return FirstGiftStatusResponse(
            has_deposit=False,
            first_deposit_amount=0.0,
            potential_bonus=0.0,
            is_eligible=False,
            is_claimed=False,
            message="You need to make a deposit first to be eligible."
        )

    # Calculate 5% of first deposit, capped at 200
    first_deposit_amount = float(first_deposit.amount)
    bonus = min(first_deposit_amount * 0.05, 200.0)

    # Check "negative profit": Total Deposits - Total Withdrawals - Current Main Balance < 0
    # Or to be simple: Total Deposits - Total Withdrawals - Total Balance <= 0 -> they lost everything
    # Let's calculate total deposits
    total_dep_query = select(func.sum(Deposit.amount)).where(Deposit.user_id == current_user.id, Deposit.status == "completed")
    total_dep_result = await db.execute(total_dep_query)
    total_deposits = float(total_dep_result.scalar() or 0.0)

    total_with_query = select(func.sum(Withdrawal.amount)).where(Withdrawal.user_id == current_user.id, Withdrawal.status == "completed")
    total_with_result = await db.execute(total_with_query)
    total_withdrawals = float(total_with_result.scalar() or 0.0)

    wallet_query = select(Wallet).where(Wallet.user_id == current_user.id)
    wallet_result = await db.execute(wallet_query)
    wallet = wallet_result.scalars().first()
    
    total_balance = 0.0
    if wallet:
        total_balance = float(wallet.main_balance) + float(wallet.winning_balance) + float(wallet.bonus_balance)

    profit = total_withdrawals + total_balance - total_deposits
    
    # "Negative profit" means they have less money than they put in
    is_eligible = profit < 0

    return FirstGiftStatusResponse(
        has_deposit=True,
        first_deposit_amount=first_deposit_amount,
        potential_bonus=bonus,
        is_eligible=is_eligible,
        is_claimed=False,
        message="Eligible to claim!" if is_eligible else "You must have negative profit to claim this bonus."
    )

@router.post("/claim", response_model=FirstGiftClaimResponse)
async def claim_first_gift(
    db: AsyncSession = Depends(get_async_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Claim the first gift bonus.
    """
    status_response = await get_first_gift_status(db, current_user)
    
    if status_response.is_claimed:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Bonus already claimed.")
        
    if not status_response.has_deposit:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No deposit found.")
        
    if not status_response.is_eligible:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Not eligible (requires negative profit).")

    # Double check lock to avoid race condition
    claim_query = select(FirstGiftClaim).where(FirstGiftClaim.user_id == current_user.id).with_for_update()
    claim_result = await db.execute(claim_query)
    if claim_result.scalars().first():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Bonus already claimed.")

    bonus_amount = status_response.potential_bonus

    # Record claim
    new_claim = FirstGiftClaim(
        user_id=current_user.id,
        amount_claimed=bonus_amount
    )
    db.add(new_claim)

    # Credit Wallet
    wallet_service = WalletService(db)
    await wallet_service.add_bonus_balance(
        user_id=current_user.id,
        amount=bonus_amount,
        transaction_type="FIRST_GIFT_BONUS",
        description=f"First Gift (5% of First Deposit)"
    )

    await db.commit()

    return FirstGiftClaimResponse(
        claimed_amount=bonus_amount,
        message="Bonus claimed successfully!"
    )
