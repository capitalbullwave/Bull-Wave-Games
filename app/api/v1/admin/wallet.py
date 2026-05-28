from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import Any
from datetime import datetime, timezone

from app.core.database import get_async_db
from app.core.deps import get_current_user, security_bearer
from app.schemas.responses import BaseResponse, success_response
from app.schemas.wallet import WithdrawalListResponse, WithdrawalActionRequest, WithdrawalResponse
from app.models.wallets import Withdrawal, WalletTransaction, Wallet
from app.models.users import User

router = APIRouter()

async def get_admin_user(current_user: User = Depends(get_current_user)):
    if current_user.role not in ["admin", "superadmin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    return current_user

@router.get("/withdraw/list", response_model=BaseResponse[WithdrawalListResponse])
async def list_withdrawals(
    status_filter: str = Query(None, description="pending, approved, rejected, processing, completed, failed"),
    page: int = Query(1, ge=1),
    size: int = Query(10, ge=1, le=100),
    admin_user = Depends(get_admin_user),
    db: AsyncSession = Depends(get_async_db)
) -> Any:
    offset = (page - 1) * size
    query = select(Withdrawal)
    
    if status_filter:
        query = query.where(Withdrawal.status == status_filter)
        
    count_query = select(func.count()).select_from(query.subquery())
    
    query = query.order_by(Withdrawal.created_at.desc()).offset(offset).limit(size)
    
    result = await db.execute(query)
    total = await db.scalar(count_query)
    
    return success_response({
        "items": list(result.scalars().all()),
        "total": total or 0,
        "page": page,
        "size": size
    })

@router.post("/withdraw/approve", response_model=BaseResponse[WithdrawalResponse])
async def approve_withdrawal(
    schema: WithdrawalActionRequest,
    admin_user = Depends(get_admin_user),
    db: AsyncSession = Depends(get_async_db)
) -> Any:
    withdrawal = await db.get(Withdrawal, schema.withdrawal_id)
    if not withdrawal:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Withdrawal not found")
        
    if withdrawal.status != "pending":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Cannot approve withdrawal in status: {withdrawal.status}")
        
    withdrawal.status = "approved"
    withdrawal.processed_at = datetime.now(timezone.utc)
    
    await db.commit()
    await db.refresh(withdrawal)
    
    return success_response(withdrawal, "Withdrawal approved successfully")

@router.post("/withdraw/reject", response_model=BaseResponse[WithdrawalResponse])
async def reject_withdrawal(
    schema: WithdrawalActionRequest,
    admin_user = Depends(get_admin_user),
    db: AsyncSession = Depends(get_async_db)
) -> Any:
    withdrawal = await db.get(Withdrawal, schema.withdrawal_id)
    if not withdrawal:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Withdrawal not found")
        
    if withdrawal.status != "pending":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Cannot reject withdrawal in status: {withdrawal.status}")
        
    # Refund the amount to the user's main wallet
    wallet = await db.scalar(select(Wallet).where(Wallet.user_id == withdrawal.user_id))
    if wallet:
        wallet.main_balance += withdrawal.amount
        
        # Log refund transaction
        refund_txn = WalletTransaction(
            wallet_id=wallet.id,
            amount=withdrawal.amount,
            wallet_type="main",
            transaction_type="refund",
            reference_id=f"W-REJECT-{withdrawal.id}",
            description=f"Refund for rejected withdrawal: {schema.reason or 'No reason provided'}"
        )
        db.add(refund_txn)
        
    withdrawal.status = "rejected"
    withdrawal.rejection_reason = schema.reason
    withdrawal.processed_at = datetime.now(timezone.utc)
    
    await db.commit()
    await db.refresh(withdrawal)
    
    return success_response(withdrawal, "Withdrawal rejected and amount refunded")
