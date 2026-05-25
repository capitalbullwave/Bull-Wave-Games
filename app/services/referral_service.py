from decimal import Decimal
from typing import List, Dict, Any
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.referrals import Referral, ReferralCommission
from app.models.users import User
from app.repositories.wallet_repository import WalletRepository
from app.core.config import settings

class ReferralService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.wallet_repo = WalletRepository(db)

    async def map_referral_tiers(self, referrer_id: int, referee_id: int):
        """
        Creates referral links mapping up to 3 hierarchical parent levels.
        e.g., User C referred by B, B referred by A:
          - level 1: B (direct referrer of C)
          - level 2: A (referrer of B)
          - level 3: A's referrer (if present)
        """
        # Level 1 mapping
        l1_ref = Referral(referrer_id=referrer_id, referee_id=referee_id, level=1)
        self.db.add(l1_ref)
        
        # Query Level 2: Find who referred the referrer
        q2 = select(Referral).where(Referral.referee_id == referrer_id, Referral.level == 1)
        res2 = await self.db.execute(q2)
        l2_parent = res2.scalars().first()
        
        if l2_parent:
            l2_ref = Referral(referrer_id=l2_parent.referrer_id, referee_id=referee_id, level=2)
            self.db.add(l2_ref)
            
            # Query Level 3: Find who referred level 2
            q3 = select(Referral).where(Referral.referee_id == l2_parent.referrer_id, Referral.level == 1)
            res3 = await self.db.execute(q3)
            l3_parent = res3.scalars().first()
            if l3_parent:
                l3_ref = Referral(referrer_id=l3_parent.referrer_id, referee_id=referee_id, level=3)
                self.db.add(l3_ref)
        
        await self.db.flush()

    async def distribute_bet_commissions(self, referee_id: int, bet_amount: float, bet_id: int):
        """
        Calculates and adds commission to parents on bet placement or bet settlement.
        Commission rates: Level 1: 5%, Level 2: 3%, Level 3: 1%
        """
        # Find all referrers of the betting user
        query = select(Referral).where(Referral.referee_id == referee_id)
        result = await self.db.execute(query)
        referrals = list(result.scalars().all())

        commission_rates = {
            1: settings.REFERRAL_COMMISSION_L1,
            2: settings.REFERRAL_COMMISSION_L2,
            3: settings.REFERRAL_COMMISSION_L3
        }

        for ref in referrals:
            rate = commission_rates.get(ref.level, 0.0)
            if rate <= 0.0:
                continue

            commission_value = float(Decimal(str(bet_amount)) * Decimal(str(rate)))
            if commission_value <= 0.0:
                continue

            # Lock the referrer's wallet row to safely credit commissions
            ref_wallet = await self.wallet_repo.get_by_user_id_with_lock(ref.referrer_id)
            if not ref_wallet or ref_wallet.is_frozen:
                continue

            # Add to referral balance
            ref_wallet.referral_balance = float(Decimal(str(ref_wallet.referral_balance)) + Decimal(str(commission_value)))

            # Log ReferralCommission
            commission_log = ReferralCommission(
                referrer_id=ref.referrer_id,
                referee_id=referee_id,
                commission_amount=commission_value,
                level=ref.level,
                bet_id=bet_id,
                status="paid"
            )
            self.db.add(commission_log)

            # Create Wallet transaction
            await self.wallet_repo.create_transaction(
                wallet_id=ref_wallet.id,
                amount=commission_value,
                wallet_type="referral",
                transaction_type="referral_commission",
                reference_id=str(bet_id),
                description=f"Level {ref.level} commission from wager ref #{bet_id}"
            )
        
        await self.db.flush()

    async def get_referral_summary(self, user_id: int) -> Dict[str, Any]:
        from sqlalchemy import func
        # Count direct referrals
        q_count = select(func.count(Referral.id)).where(Referral.referrer_id == user_id, Referral.level == 1)
        r_count = await self.db.execute(q_count)
        direct_count = r_count.scalar() or 0

        # Sum earned commissions
        q_sum = select(func.sum(ReferralCommission.commission_amount)).where(ReferralCommission.referrer_id == user_id)
        r_sum = await self.db.execute(q_sum)
        total_commissions = float(r_sum.scalar() or 0.00)

        # Get referral code
        q_user = select(User.referral_code).where(User.id == user_id)
        r_user = await self.db.execute(q_user)
        ref_code = r_user.scalar() or ""

        return {
            "direct_referrals_count": direct_count,
            "total_commissions": total_commissions,
            "referral_code": ref_code,
            "referral_link": f"https://bullwavegames.com/register?ref={ref_code}"
        }
