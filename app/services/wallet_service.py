from decimal import Decimal
from datetime import datetime
from typing import Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status

from app.repositories.wallet_repository import WalletRepository
from app.models.wallets import Wallet, WalletTransaction, Deposit, Withdrawal
from app.models.games import Bet

class WalletService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.wallet_repo = WalletRepository(db)

    async def get_balances(self, user_id: int) -> Wallet:
        wallet = await self.wallet_repo.get_by_user_id(user_id)
        if not wallet:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Wallet not found")
        return wallet

    async def deposit_funds(
        self, user_id: int, amount: float, gateway: str, gateway_tx_id: Optional[str] = None, payload: Optional[str] = None
    ) -> Deposit:
        # Acquire lock to update balance safely
        wallet = await self.wallet_repo.get_by_user_id_with_lock(user_id)
        if not wallet:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Wallet not found")
        
        if wallet.is_frozen:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Wallet is frozen")

        # Create Deposit log
        deposit = Deposit(
            user_id=user_id,
            amount=amount,
            gateway=gateway,
            gateway_tx_id=gateway_tx_id,
            status="completed",  # Mock / Webhook completes it
            payload=payload
        )
        self.db.add(deposit)
        await self.db.flush()

        # Update wallet balance
        wallet.main_balance = float(Decimal(str(wallet.main_balance)) + Decimal(str(amount)))
        
        # Write transaction ledger entry
        await self.wallet_repo.create_transaction(
            wallet_id=wallet.id,
            amount=amount,
            wallet_type="main",
            transaction_type="deposit",
            reference_id=str(deposit.id),
            description=f"Deposit via {gateway.upper()} ref {gateway_tx_id}"
        )
        
        await self.db.flush()
        
        from app.services.invitation_service import InvitationService
        invitation_srv = InvitationService(self.db)
        await invitation_srv.process_first_deposit(user_id, amount)
        
        return deposit

    async def credit_wallet(
        self, user_id: int, amount: float, gateway: str, gateway_tx_id: Optional[str] = None, deposit_id: Optional[int] = None
    ) -> None:
        """Credit wallet balance and write ledger entry WITHOUT creating a new Deposit record.
        Use this when the Deposit record already exists (e.g. after Razorpay payment verification)."""
        wallet = await self.wallet_repo.get_by_user_id_with_lock(user_id)
        if not wallet:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Wallet not found")

        if wallet.is_frozen:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Wallet is frozen")

        # Update wallet main balance
        wallet.main_balance = float(Decimal(str(wallet.main_balance)) + Decimal(str(amount)))

        # Write transaction ledger entry
        ref_id = str(deposit_id) if deposit_id else gateway_tx_id
        await self.wallet_repo.create_transaction(
            wallet_id=wallet.id,
            amount=amount,
            wallet_type="main",
            transaction_type="deposit",
            reference_id=ref_id,
            description=f"Deposit via {gateway.upper()} ref {gateway_tx_id}"
        )

        await self.db.flush()

        from app.services.invitation_service import InvitationService
        invitation_srv = InvitationService(self.db)
        await invitation_srv.process_first_deposit(user_id, amount)

    async def initiate_withdrawal(
        self, user_id: int, amount: float, bank_account_id: int
    ) -> Withdrawal:
        # Acquire lock
        wallet = await self.wallet_repo.get_by_user_id_with_lock(user_id)
        if not wallet:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Wallet not found")
            
        if wallet.is_frozen:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Wallet is frozen")

        # Gaming platforms typically restrict withdrawals to "winning" or "referral" wallets
        winning_dec = Decimal(str(wallet.winning_balance))
        amount_dec = Decimal(str(amount))
        
        if winning_dec < amount_dec:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Insufficient balance in winning wallet. Available: {wallet.winning_balance}"
            )

        # Create Withdrawal entry
        withdrawal = Withdrawal(
            user_id=user_id,
            bank_account_id=bank_account_id,
            amount=amount,
            status="pending"
        )
        self.db.add(withdrawal)
        await self.db.flush()

        # Deduct from winning balance immediately
        wallet.winning_balance = float(winning_dec - amount_dec)

        # Create Transaction
        await self.wallet_repo.create_transaction(
            wallet_id=wallet.id,
            amount=-amount,
            wallet_type="winning",
            transaction_type="withdraw",
            reference_id=str(withdrawal.id),
            description="Withdrawal request submitted"
        )
        
        await self.db.flush()
        return withdrawal

    async def place_bet(
        self, user_id: int, game_id: int, amount: float, wallet_type: str = "main", prediction: Optional[str] = None
    ) -> Bet:
        # Lock wallet row
        wallet = await self.wallet_repo.get_by_user_id_with_lock(user_id)
        if not wallet:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Wallet not found")

        if wallet.is_frozen:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Wallet is frozen")

        # Choose wallet balance partition
        balance_attr = f"{wallet_type}_balance"
        if not hasattr(wallet, balance_attr):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid wallet type")
            
        balance_val = Decimal(str(getattr(wallet, balance_attr)))
        amount_dec = Decimal(str(amount))
        
        if balance_val < amount_dec:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Insufficient funds in {wallet_type} wallet. Available: {balance_val}"
            )

        # Create Bet Record
        bet = Bet(
            user_id=user_id,
            game_id=game_id,
            bet_amount=amount,
            wallet_type=wallet_type,
            prediction=prediction,
            status="pending"
        )
        self.db.add(bet)
        await self.db.flush()

        # Deduct balance
        new_balance = float(balance_val - amount_dec)
        setattr(wallet, balance_attr, new_balance)

        # Create Transaction
        await self.wallet_repo.create_transaction(
            wallet_id=wallet.id,
            amount=-amount,
            wallet_type=wallet_type,
            transaction_type="bet_placed",
            reference_id=str(bet.id),
            description=f"Wager on game #{game_id}"
        )
        
        # Trigger referral commission calculations asynchronously
        # E.g. in real production, celery task: calculate_commissions.delay(user_id, amount, bet.id)
        from app.services.referral_service import ReferralService
        referral_srv = ReferralService(self.db)
        await referral_srv.distribute_bet_commissions(user_id, amount, bet.id)
        
        # Update Activity Progress
        from app.services.activity_service import ActivityService
        activity_srv = ActivityService(self.db)
        await activity_srv.add_bet_progress(user_id, amount)

        # Update Rebate Progress
        from app.services.rebate_service import RebateService
        rebate_srv = RebateService(self.db)
        await rebate_srv.process_bet_rebate(user_id, amount, game_id)

        await self.db.flush()
        return bet

    async def settle_win(self, bet_id: int, payout_amount: float) -> Bet:
        # Load bet
        from sqlalchemy import select
        query = select(Bet).where(Bet.id == bet_id).with_for_update()
        result = await self.db.execute(query)
        bet = result.scalars().first()
        if not bet or bet.status != "pending":
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Bet not found or already settled")

        # Lock user's wallet
        wallet = await self.wallet_repo.get_by_user_id_with_lock(bet.user_id)
        if not wallet:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Wallet not found")

        # Settle bet
        bet.status = "won"
        bet.payout_amount = payout_amount
        bet.settled_at = datetime.now()

        # Credit winnings into winning wallet
        wallet.winning_balance = float(Decimal(str(wallet.winning_balance)) + Decimal(str(payout_amount)))

        # Create transaction log
        await self.wallet_repo.create_transaction(
            wallet_id=wallet.id,
            amount=payout_amount,
            wallet_type="winning",
            transaction_type="game_won",
            reference_id=str(bet.id),
            description=f"Winnings credited for bet #{bet.id}"
        )

        await self.db.flush()
        return bet

    async def settle_loss(self, bet_id: int) -> Bet:
        # Load bet
        from sqlalchemy import select
        query = select(Bet).where(Bet.id == bet_id)
        result = await self.db.execute(query)
        bet = result.scalars().first()
        if not bet or bet.status != "pending":
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Bet not found or already settled")

        bet.status = "lost"
        bet.settled_at = datetime.now()
        await self.db.flush()
        return bet

    async def transfer_balance(
        self, user_id: int, amount: float, source_wallet: str
    ) -> Wallet:
        # Lock user's wallet
        wallet = await self.wallet_repo.get_by_user_id_with_lock(user_id)
        if not wallet or wallet.is_frozen:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Wallet locked or unavailable")

        if source_wallet not in ["winning", "referral"]:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid source wallet partition")

        source_attr = f"{source_wallet}_balance"
        source_val = Decimal(str(getattr(wallet, source_attr)))
        amount_dec = Decimal(str(amount))

        if source_val < amount_dec:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Insufficient transfer funds")

        # Deduct source
        setattr(wallet, source_attr, float(source_val - amount_dec))
        # Add target (main balance)
        wallet.main_balance = float(Decimal(str(wallet.main_balance)) + amount_dec)

        # Create audit logs
        await self.wallet_repo.create_transaction(
            wallet_id=wallet.id,
            amount=-amount,
            wallet_type=source_wallet,
            transaction_type="transfer_out",
            description=f"Transfer to Main Wallet"
        )
        await self.wallet_repo.create_transaction(
            wallet_id=wallet.id,
            amount=amount,
            wallet_type="main",
            transaction_type="transfer_in",
            description=f"Balance transferred from {source_wallet} partition"
        )

        await self.db.flush()
        return wallet

    async def add_activity_reward(self, user_id: int, amount: float, task_id: int) -> None:
        wallet = await self.wallet_repo.get_by_user_id_with_lock(user_id)
        if not wallet or wallet.is_frozen:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Wallet locked or unavailable")

        amount_dec = Decimal(str(amount))
        wallet.main_balance = float(Decimal(str(wallet.main_balance)) + amount_dec)

        await self.wallet_repo.create_transaction(
            wallet_id=wallet.id,
            amount=amount,
            wallet_type="main",
            transaction_type="ACTIVITY_REWARD",
            reference_id=str(task_id),
            description=f"Reward for Activity Task #{task_id}"
        )
        await self.db.flush()

    async def add_bonus_balance(self, user_id: int, amount: float, transaction_type: str, description: str) -> None:
        wallet = await self.wallet_repo.get_by_user_id_with_lock(user_id)
        if not wallet or wallet.is_frozen:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Wallet locked or unavailable")

        amount_dec = Decimal(str(amount))
        wallet.bonus_balance = float(Decimal(str(wallet.bonus_balance)) + amount_dec)

        await self.wallet_repo.create_transaction(
            wallet_id=wallet.id,
            amount=amount,
            wallet_type="bonus",
            transaction_type=transaction_type,
            reference_id=None,
            description=description
        )
        await self.db.flush()

