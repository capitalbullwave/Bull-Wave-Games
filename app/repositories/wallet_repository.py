from typing import Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.base import BaseRepository
from app.models.wallets import Wallet, WalletTransaction

class WalletRepository(BaseRepository[Wallet]):
    def __init__(self, db: AsyncSession):
        super().__init__(Wallet, db)

    async def get_by_user_id(self, user_id: int) -> Optional[Wallet]:
        query = select(Wallet).where(Wallet.user_id == user_id)
        result = await self.db.execute(query)
        return result.scalars().first()

    async def get_by_user_id_with_lock(self, user_id: int) -> Optional[Wallet]:
        """
        Executes SELECT FOR UPDATE on the wallet record.
        This blocks concurrent read/writes to this user's wallet until the outer transaction commits.
        """
        query = select(Wallet).where(Wallet.user_id == user_id).with_for_update()
        result = await self.db.execute(query)
        return result.scalars().first()

    async def create_transaction(
        self,
        wallet_id: int,
        amount: float,
        wallet_type: str,        # main, bonus, winning, referral
        transaction_type: str,   # deposit, withdraw, bet_placed, game_won, etc.
        reference_id: Optional[str] = None,
        description: Optional[str] = None
    ) -> WalletTransaction:
        tx = WalletTransaction(
            wallet_id=wallet_id,
            amount=amount,
            wallet_type=wallet_type,
            transaction_type=transaction_type,
            reference_id=reference_id,
            description=description
        )
        self.db.add(tx)
        await self.db.flush()
        return tx
