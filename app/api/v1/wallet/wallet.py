from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Any, List

from app.core.database import get_async_db
from app.core.deps import get_current_user
from app.core.config import settings
from app.schemas.wallet import (
    WalletResponse,
    DepositInitiate,
    DepositResponse,
    WithdrawalCreate,
    WithdrawalResponse,
    TransferRequest,
    WalletTransactionResponse,
    PaymentVerifyRequest
)
from app.services.wallet_service import WalletService
from app.services.payment_service import PaymentService
from app.models.wallets import WalletTransaction

router = APIRouter()

@router.get("/balance", response_model=WalletResponse)
async def get_balance(
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db)
) -> Any:
    wallet_srv = WalletService(db)
    balances = await wallet_srv.get_balances(current_user.id)
    return balances

@router.post("/deposit", response_model=DepositResponse)
async def initiate_deposit(
    schema: DepositInitiate,
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db)
) -> Any:
    pay_srv = PaymentService(db)
    deposit = await pay_srv.initiate_deposit(current_user.id, schema.amount, schema.gateway)
    
    return {
        "id": deposit.id,
        "amount": deposit.amount,
        "gateway": deposit.gateway,
        "status": deposit.status,
        "gateway_tx_id": deposit.gateway_tx_id,
        "checkout_url": f"https://checkout.bullwavegames.com/pay/{deposit.gateway_tx_id}",
        "razorpay_key_id": settings.RAZORPAY_KEY_ID if deposit.gateway == "razorpay" else None
    }

@router.post("/verify-payment")
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
    return {"status": "ok", "message": "Payment verified successfully"}


@router.post("/withdraw", response_model=WithdrawalResponse)
async def withdraw(
    schema: WithdrawalCreate,
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db)
) -> Any:
    wallet_srv = WalletService(db)
    withdrawal = await wallet_srv.initiate_withdrawal(current_user.id, schema.amount, schema.bank_account_id)
    await db.commit()
    return withdrawal

@router.post("/transfer", response_model=WalletResponse)
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
    return wallet

@router.get("/transactions", response_model=List[WalletTransactionResponse])
async def list_transactions(
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db)
) -> Any:
    wallet_srv = WalletService(db)
    wallet = await wallet_srv.get_balances(current_user.id)
    
    query = select(WalletTransaction).where(WalletTransaction.wallet_id == wallet.id).order_by(WalletTransaction.created_at.desc())
    result = await db.execute(query)
    return list(result.scalars().all())
