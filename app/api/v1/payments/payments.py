from fastapi import APIRouter, Depends, HTTPException, status, Request, Header
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Any

from app.core.database import get_async_db
from app.services.payment_service import PaymentService

router = APIRouter()

@router.post("/razorpay-webhook", status_code=status.HTTP_200_OK)
async def razorpay_webhook(
    request: Request,
    x_razorpay_signature: str = Header(...),
    db: AsyncSession = Depends(get_async_db)
) -> Any:
    body_bytes = await request.body()
    pay_srv = PaymentService(db)
    success = await pay_srv.process_razorpay_webhook(body_bytes, x_razorpay_signature)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Signature validation failed or order not processed"
        )
    return {"status": "ok"}

@router.post("/cashfree-webhook", status_code=status.HTTP_200_OK)
async def cashfree_webhook(
    payload: dict,
    db: AsyncSession = Depends(get_async_db)
) -> Any:
    pay_srv = PaymentService(db)
    success = await pay_srv.process_cashfree_webhook(payload)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Order not processed"
        )
    return {"status": "ok"}
