import hmac
import hashlib
import json
import secrets
import httpx
from typing import Dict, Any, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from fastapi import HTTPException, status

from app.core.config import settings
from app.models.wallets import Deposit, PaymentLog
from app.services.wallet_service import WalletService

class PaymentService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.wallet_srv = WalletService(db)

    async def create_razorpay_order(self, amount: float, receipt_id: str) -> str:
        url = "https://api.razorpay.com/v1/orders"
        auth = (settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET)
        payload = {
            "amount": int(amount * 100),  # in paise
            "currency": "INR",
            "receipt": receipt_id
        }
        
        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(url, auth=auth, json=payload, timeout=10.0)
                if response.status_code == 200:
                    data = response.json()
                    return data["id"]
                else:
                    raise HTTPException(
                        status_code=status.HTTP_502_BAD_GATEWAY,
                        detail=f"Razorpay order creation failed: {response.text}"
                    )
            except Exception as e:
                raise HTTPException(
                    status_code=status.HTTP_502_BAD_GATEWAY,
                    detail=f"Error connecting to Razorpay: {str(e)}"
                )

    async def verify_razorpay_payment(
        self, deposit_id: int, payment_id: str, order_id: str, signature: str
    ) -> bool:
        # Load deposit regardless of status for idempotency check
        from sqlalchemy import select as sa_select
        query = sa_select(Deposit).where(Deposit.id == deposit_id)
        result = await self.db.execute(query)
        deposit = result.scalars().first()

        if not deposit:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Deposit transaction not found"
            )

        # Idempotency: if already completed, return success without re-processing
        if deposit.status == "completed":
            return True

        if deposit.status != "pending":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Deposit is in invalid state: {deposit.status}"
            )

        # Verify HMAC-SHA256 signature
        msg = f"{order_id}|{payment_id}"
        expected_signature = hmac.new(
            key=settings.RAZORPAY_KEY_SECRET.encode(),
            msg=msg.encode(),
            digestmod=hashlib.sha256
        ).hexdigest()

        if not hmac.compare_digest(expected_signature, signature):
            log = PaymentLog(
                event_type="verification",
                gateway="razorpay",
                payload=json.dumps({
                    "deposit_id": deposit_id,
                    "payment_id": payment_id,
                    "order_id": order_id,
                    "signature": signature
                }),
                status="invalid_sig"
            )
            self.db.add(log)
            await self.db.commit()
            return False

        # Mark deposit as completed (update existing record, do NOT create a new one)
        deposit.status = "completed"
        deposit.gateway_tx_id = payment_id
        deposit.payload = json.dumps({
            "razorpay_payment_id": payment_id,
            "razorpay_order_id": order_id,
            "razorpay_signature": signature
        })

        # Credit wallet balance ONLY (no new Deposit row — avoids UniqueViolationError)
        await self.wallet_srv.credit_wallet(
            user_id=deposit.user_id,
            amount=float(deposit.amount),
            gateway="razorpay",
            gateway_tx_id=payment_id,
            deposit_id=deposit.id
        )

        # Save verification success log
        log = PaymentLog(
            event_type="verification",
            gateway="razorpay",
            payload=deposit.payload,
            status="processed"
        )
        self.db.add(log)
        await self.db.commit()
        return True


    async def initiate_deposit(self, user_id: int, amount: float, gateway: str) -> Deposit:
        # Create a temporary pending deposit record to generate deposit ID
        tx_id = f"BW_TX_PEND_{secrets.token_hex(4).upper()}"
        deposit = Deposit(
            user_id=user_id,
            amount=amount,
            gateway=gateway,
            gateway_tx_id=tx_id,
            status="pending"
        )
        self.db.add(deposit)
        await self.db.flush()  # populate deposit.id
        
        # If Razorpay, create a real order on Razorpay
        if gateway == "razorpay":
            order_id = await self.create_razorpay_order(amount, f"BW_DEP_{deposit.id}")
            deposit.gateway_tx_id = order_id
            
        await self.db.commit()
        return deposit

    async def process_razorpay_webhook(self, body_bytes: bytes, signature: str) -> bool:
        # Save logs
        log = PaymentLog(
            event_type="webhook",
            gateway="razorpay",
            payload=body_bytes.decode(),
            status="pending"
        )
        self.db.add(log)
        await self.db.flush()

        # Validate signature
        expected_signature = hmac.new(
            key=settings.RAZORPAY_WEBHOOK_SECRET.encode(),
            msg=body_bytes,
            digestmod=hashlib.sha256
        ).hexdigest()

        if not hmac.compare_digest(expected_signature, signature):
            log.status = "invalid_sig"
            await self.db.commit()
            return False

        # Parse payload
        data = json.loads(body_bytes.decode())
        event = data.get("event")
        
        if event == "payment.captured":
            payment_entity = data["payload"]["payment"]["entity"]
            order_id = payment_entity.get("order_id")
            amount = float(payment_entity.get("amount", 0)) / 100.0  # Razorpay in paise
            gateway_payment_id = payment_entity.get("id")

            # Update corresponding pending deposit
            # In mock mode we match via status or customize
            query = select(Deposit).where(Deposit.status == "pending", Deposit.amount == amount).order_by(Deposit.created_at.desc())
            result = await self.db.execute(query)
            deposit = result.scalars().first()

            if deposit:
                deposit.status = "completed"
                deposit.gateway_tx_id = gateway_payment_id
                deposit.payload = json.dumps(data)
                
                # Credit wallet
                await self.wallet_srv.deposit_funds(
                    user_id=deposit.user_id,
                    amount=amount,
                    gateway="razorpay",
                    gateway_tx_id=gateway_payment_id,
                    payload=json.dumps(payment_entity)
                )
                log.status = "processed"
            else:
                log.status = "deposit_not_found"
        else:
            log.status = f"unhandled_event:{event}"[:20]

        await self.db.commit()
        return True

    async def process_cashfree_webhook(self, payload: Dict[str, Any]) -> bool:
        # Simulated cashfree webhook handler
        log = PaymentLog(
            event_type="webhook",
            gateway="cashfree",
            payload=json.dumps(payload),
            status="pending"
        )
        self.db.add(log)
        await self.db.flush()

        # Extract elements
        order_status = payload.get("order_status")
        order_id = payload.get("order_id")
        amount = float(payload.get("order_amount", 0))
        cf_payment_id = payload.get("cf_payment_id")

        if order_status == "PAID":
            query = select(Deposit).where(Deposit.gateway_tx_id == order_id, Deposit.status == "pending")
            result = await self.db.execute(query)
            deposit = result.scalars().first()

            if deposit:
                deposit.status = "completed"
                deposit.payload = json.dumps(payload)
                
                await self.wallet_srv.deposit_funds(
                    user_id=deposit.user_id,
                    amount=amount,
                    gateway="cashfree",
                    gateway_tx_id=cf_payment_id,
                    payload=json.dumps(payload)
                )
                log.status = "processed"
            else:
                log.status = "deposit_not_found"
        else:
            log.status = f"order_status_not_paid:{order_status}"[:20]

        await self.db.commit()
        return True
