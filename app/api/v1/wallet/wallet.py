from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import Any, List, Optional

from app.core.database import get_async_db
from app.core.deps import get_current_user
from app.core.config import settings
from app.schemas.responses import BaseResponse, success_response
from app.schemas.wallet import (
    WalletResponse,
    DepositInitiate,
    DepositResponse,
    WithdrawalCreate,
    WithdrawalResponse,
    TransferRequest,
    WalletTransactionResponse,
    PaymentVerifyRequest,
    WalletSummaryResponse,
    TransactionListResponse,
    DepositListResponse,
    WithdrawalListResponse
)
from app.services.wallet_service import WalletService
from app.services.payment_service import PaymentService
from app.models.wallets import WalletTransaction, Withdrawal, Deposit

router = APIRouter()

@router.get("/balance", response_model=BaseResponse[WalletResponse])
async def get_balance(
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db)
) -> Any:
    wallet_srv = WalletService(db)
    balances = await wallet_srv.get_balances(current_user.id)
    return success_response(balances)

@router.post("/deposit/create", response_model=BaseResponse[DepositResponse])
async def initiate_deposit(
    schema: DepositInitiate,
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db)
) -> Any:
    pay_srv = PaymentService(db)
    deposit = await pay_srv.initiate_deposit(current_user.id, schema.amount, schema.gateway)
    
    return success_response({
        "id": deposit.id,
        "amount": deposit.amount,
        "gateway": deposit.gateway,
        "status": deposit.status,
        "gateway_tx_id": deposit.gateway_tx_id,
        "checkout_url": f"https://checkout.bullwavegames.com/pay/{deposit.gateway_tx_id}",
        "razorpay_key_id": settings.RAZORPAY_KEY_ID if deposit.gateway == "razorpay" else None
    }, "Deposit initiated")

@router.post("/deposit/verify", response_model=BaseResponse[dict])
async def verify_payment(
    schema: PaymentVerifyRequest,
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db)
) -> Any:
    pay_srv = PaymentService(db)
    success = await pay_srv.verify_razorpay_payment(
        deposit_id=schema.deposit_id,
        payment_id=schema.payment_id,
        order_id=schema.order_id,
        signature=schema.signature
    )
    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Payment signature verification failed"
        )
    return success_response({"status": "ok"}, "Payment verified successfully")

@router.get("/deposit/history", response_model=BaseResponse[DepositListResponse])
async def list_deposits(
    page: int = Query(1, ge=1),
    size: int = Query(10, ge=1, le=100),
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db)
) -> Any:
    offset = (page - 1) * size
    query = select(Deposit).where(Deposit.user_id == current_user.id).order_by(Deposit.created_at.desc()).offset(offset).limit(size)
    count_query = select(func.count()).select_from(Deposit).where(Deposit.user_id == current_user.id)
    
    result = await db.execute(query)
    total = await db.scalar(count_query)
    
    return success_response({
        "items": list(result.scalars().all()),
        "total": total or 0,
        "page": page,
        "size": size
    })

@router.post("/withdraw/create", response_model=BaseResponse[WithdrawalResponse])
async def withdraw(
    schema: WithdrawalCreate,
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db)
) -> Any:
    wallet_srv = WalletService(db)
    withdrawal = await wallet_srv.initiate_withdrawal(current_user.id, schema.amount, schema.bank_account_id)
    await db.commit()
    return success_response(withdrawal, "Withdrawal request created")

@router.get("/withdraw/history", response_model=BaseResponse[WithdrawalListResponse])
async def list_withdrawals(
    page: int = Query(1, ge=1),
    size: int = Query(10, ge=1, le=100),
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db)
) -> Any:
    offset = (page - 1) * size
    query = select(Withdrawal).where(Withdrawal.user_id == current_user.id).order_by(Withdrawal.created_at.desc()).offset(offset).limit(size)
    count_query = select(func.count()).select_from(Withdrawal).where(Withdrawal.user_id == current_user.id)
    
    result = await db.execute(query)
    total = await db.scalar(count_query)
    
    return success_response({
        "items": list(result.scalars().all()),
        "total": total or 0,
        "page": page,
        "size": size
    })

@router.post("/transfer", response_model=BaseResponse[WalletResponse])
async def transfer_balance(
    schema: TransferRequest,
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db)
) -> Any:
    if schema.target_wallet != "main":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Balance transfers are only supported to the 'main' wallet"
        )
    wallet_srv = WalletService(db)
    wallet = await wallet_srv.transfer_balance(current_user.id, schema.amount, schema.source_wallet)
    await db.commit()
    return success_response(wallet, "Balance transferred successfully")

@router.get("/transactions", response_model=BaseResponse[TransactionListResponse])
async def list_transactions(
    type: Optional[str] = Query(None, description="deposit, withdraw, bet_placed, game_won, refund, bonus_credit"),
    page: int = Query(1, ge=1),
    size: int = Query(10, ge=1, le=100),
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db)
) -> Any:
    wallet_srv = WalletService(db)
    wallet = await wallet_srv.get_balances(current_user.id)
    
    offset = (page - 1) * size
    query = select(WalletTransaction).where(WalletTransaction.wallet_id == wallet.id)
    
    if type:
        # map user filters to internal types if needed
        # user requested: bet, win, bonus
        # internal: bet_placed, game_won, bonus_credit
        type_mapping = {
            "bet": "bet_placed",
            "win": "game_won",
            "bonus": "bonus_credit"
        }
        internal_type = type_mapping.get(type, type)
        query = query.where(WalletTransaction.transaction_type == internal_type)
        
    count_query = select(func.count()).select_from(query.subquery())
    
    query = query.order_by(WalletTransaction.created_at.desc()).offset(offset).limit(size)
    
    result = await db.execute(query)
    total = await db.scalar(count_query)
    
    return success_response({
        "items": list(result.scalars().all()),
        "total": total or 0,
        "page": page,
        "size": size
    })

@router.get("/summary", response_model=BaseResponse[WalletSummaryResponse])
async def wallet_summary(
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db)
) -> Any:
    wallet_srv = WalletService(db)
    wallet = await wallet_srv.get_balances(current_user.id)
    
    # Aggregate from wallet transactions
    # Note: sum returns None if no rows match, we coalesce or handle it
    stats = await db.execute(
        select(
            WalletTransaction.transaction_type,
            func.sum(WalletTransaction.amount).label("total_amount")
        ).where(WalletTransaction.wallet_id == wallet.id)
        .group_by(WalletTransaction.transaction_type)
    )
    
    summary = {
        "total_deposit": 0.0,
        "total_withdraw": 0.0,
        "total_bonus": 0.0,
        "total_bets": 0.0,
        "total_wins": 0.0
    }
    
    for row in stats.all():
        ttype = row.transaction_type
        amount = float(row.total_amount or 0)
        if ttype == "deposit":
            summary["total_deposit"] += amount
        elif ttype == "withdraw":
            summary["total_withdraw"] += amount
        elif ttype == "bonus_credit":
            summary["total_bonus"] += amount
        elif ttype == "bet_placed":
            summary["total_bets"] += amount
        elif ttype == "game_won":
            summary["total_wins"] += amount

    return success_response(summary)
