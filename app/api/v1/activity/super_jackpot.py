from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import Any
from datetime import datetime

from app.core.deps import get_async_db, get_current_user
from app.models.users import User
from app.models.super_jackpots import UserSuperJackpot
from app.schemas.super_jackpots import SuperJackpotStatusResponse, SuperJackpotClaimResponse
from app.services.wallet_service import WalletService

router = APIRouter()

@router.get("/status", response_model=SuperJackpotStatusResponse)
async def get_super_jackpot_status(
    db: AsyncSession = Depends(get_async_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Get the user's active/unclaimed super jackpots.
    """
    # Fetch unclaimed jackpots that haven't expired
    now = datetime.now()
    query = select(UserSuperJackpot).where(
        UserSuperJackpot.user_id == current_user.id,
        UserSuperJackpot.is_claimed == False,
        UserSuperJackpot.expires_at > now
    )
    result = await db.execute(query)
    jackpots = result.scalars().all()

    total_amount = sum(j.amount for j in jackpots)
    
    return SuperJackpotStatusResponse(
        unclaimed_count=len(jackpots),
        total_unclaimed_amount=total_amount,
        jackpots=jackpots
    )

@router.post("/claim", response_model=SuperJackpotClaimResponse)
async def claim_super_jackpots(
    db: AsyncSession = Depends(get_async_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Claim all active/unclaimed super jackpots in a batch.
    """
    now = datetime.now()
    
    # We must lock the rows we are claiming to avoid race conditions
    query = select(UserSuperJackpot).where(
        UserSuperJackpot.user_id == current_user.id,
        UserSuperJackpot.is_claimed == False,
        UserSuperJackpot.expires_at > now
    ).with_for_update()
    
    result = await db.execute(query)
    jackpots = result.scalars().all()

    if not jackpots:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No active super jackpots to claim."
        )
        
    total_amount = 0.0
    for j in jackpots:
        j.is_claimed = True
        j.claimed_at = now
        total_amount += j.amount
        
    # Credit the user's wallet
    wallet_service = WalletService(db)
    await wallet_service.add_bonus_balance(
        user_id=current_user.id,
        amount=total_amount,
        transaction_type="SUPER_JACKPOT",
        description=f"Claimed {len(jackpots)} Super Jackpot(s)"
    )
    
    # Commit changes
    await db.commit()

    return SuperJackpotClaimResponse(
        claimed_count=len(jackpots),
        total_claimed_amount=total_amount
    )
