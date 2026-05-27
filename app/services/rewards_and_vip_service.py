from datetime import datetime, timezone, timedelta
from decimal import Decimal
from typing import Optional, List
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status

from app.models.rewards import Reward, Coupon
from app.models.vip_and_audit import VIPLevel
from app.models.users import User
from app.models.wallets import Deposit
from app.models.games import Bet
from app.repositories.wallet_repository import WalletRepository
from app.services.wallet_service import WalletService

class RewardsAndVIPService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.wallet_repo = WalletRepository(db)
        self.wallet_srv = WalletService(db)

    async def claim_daily_checkin(self, user_id: int) -> Reward:
        # Check if already claimed today
        today = datetime.now(timezone.utc).date()
        query = select(Reward).where(
            Reward.user_id == user_id,
            Reward.type == "daily_checkin",
            func.date(Reward.created_at) == today
        )
        res = await self.db.execute(query)
        claimed_today = res.scalars().first()
        if claimed_today:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Daily check-in already claimed for today"
            )

        # Count streak (how many checkins in last 7 days)
        streak_query = select(func.count(Reward.id)).where(
            Reward.user_id == user_id,
            Reward.type == "daily_checkin",
            Reward.created_at >= datetime.now(timezone.utc) - timedelta(days=7)
        )
        streak_res = await self.db.execute(streak_query)
        streak = (streak_res.scalar() or 0) % 7
        
        # Streak rewards scale
        daily_amounts = {0: 10.0, 1: 20.0, 2: 30.0, 3: 40.0, 4: 50.0, 5: 80.0, 6: 100.0}
        amount = daily_amounts.get(streak, 10.0)

        # Credit to bonus wallet partition
        wallet = await self.wallet_repo.get_by_user_id_with_lock(user_id)
        if not wallet or wallet.is_frozen:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Wallet frozen or unavailable")
            
        wallet.bonus_balance = float(Decimal(str(wallet.bonus_balance)) + Decimal(str(amount)))

        # Log Reward
        reward = Reward(
            user_id=user_id,
            type="daily_checkin",
            amount=amount,
            status="claimed",
            details=f"Day {streak + 1} check-in streak reward"
        )
        self.db.add(reward)

        # Write Transaction
        await self.wallet_repo.create_transaction(
            wallet_id=wallet.id,
            amount=amount,
            wallet_type="bonus",
            transaction_type="bonus_credit",
            description=f"Claimed Day {streak + 1} check-in bonus"
        )

        await self.db.flush()
        return reward

    async def claim_coupon(self, user_id: int, coupon_code: str) -> Reward:
        # Load coupon
        q_coupon = select(Coupon).where(Coupon.code == coupon_code, Coupon.is_active == True)
        res_coupon = await self.db.execute(q_coupon)
        coupon = res_coupon.scalars().first()
        if not coupon or coupon.expires_at < datetime.now(timezone.utc):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Coupon is invalid, expired or deactivated"
            )

        if coupon.current_usage >= coupon.usage_limit:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Coupon usage limit reached"
            )

        # Check if this user already used it
        q_used = select(Reward).where(
            Reward.user_id == user_id,
            Reward.type == "coupon_claim",
            Reward.details == f"coupon_code:{coupon_code}"
        )
        res_used = await self.db.execute(q_used)
        if res_used.scalars().first():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="You have already claimed this coupon"
            )

        # Determine reward amount
        amount = float(coupon.value)

        # Credit to bonus wallet partition
        wallet = await self.wallet_repo.get_by_user_id_with_lock(user_id)
        if not wallet or wallet.is_frozen:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Wallet unavailable")

        wallet.bonus_balance = float(Decimal(str(wallet.bonus_balance)) + Decimal(str(amount)))
        coupon.current_usage += 1

        reward = Reward(
            user_id=user_id,
            type="coupon_claim",
            amount=amount,
            status="claimed",
            details=f"coupon_code:{coupon_code}"
        )
        self.db.add(reward)

        await self.wallet_repo.create_transaction(
            wallet_id=wallet.id,
            amount=amount,
            wallet_type="bonus",
            transaction_type="bonus_credit",
            reference_id=str(coupon.id),
            description=f"Promo code {coupon_code} claimed successfully"
        )

        await self.db.flush()
        return reward

    async def spin_wheel(self, user_id: int) -> float:
        # Require spin wheel ticket / wager milestone or just charge entry fee from bonus/main wallet
        # Let's say it costs 20 from main balance to spin, and awards a random multiplier prize
        import random
        prizes = [0.0, 5.0, 10.0, 20.0, 50.0, 100.0, 500.0]
        weights = [0.1, 0.3, 0.3, 0.15, 0.1, 0.04, 0.01]  # Probabilities
        prize = float(random.choices(prizes, weights=weights)[0])

        if prize > 0:
            wallet = await self.wallet_repo.get_by_user_id_with_lock(user_id)
            if not wallet or wallet.is_frozen:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Wallet unavailable")

            wallet.bonus_balance = float(Decimal(str(wallet.bonus_balance)) + Decimal(str(prize)))
            
            reward = Reward(
                user_id=user_id,
                type="spin_wheel",
                amount=prize,
                status="claimed",
                details="Lucky wheel spin reward"
            )
            self.db.add(reward)

            await self.wallet_repo.create_transaction(
                wallet_id=wallet.id,
                amount=prize,
                wallet_type="bonus",
                transaction_type="bonus_credit",
                description="Spin wheel match prize"
            )
            await self.db.flush()

        return prize

    async def evaluate_vip_level(self, user_id: int) -> Optional[VIPLevel]:
        # Lock user
        q_user = select(User).where(User.id == user_id).with_for_update()
        res_user = await self.db.execute(q_user)
        user = res_user.scalars().first()
        if not user:
            return None

        # Calculate lifetime metrics
        # 1. Total deposits
        q_dep = select(func.sum(Deposit.amount)).where(Deposit.user_id == user_id, Deposit.status == "completed")
        res_dep = await self.db.execute(q_dep)
        tot_dep = float(res_dep.scalar() or 0.0)

        # 2. Total wagers (bets placed)
        q_bet = select(func.sum(Bet.bet_amount)).where(Bet.user_id == user_id)
        res_bet = await self.db.execute(q_bet)
        tot_wager = float(res_bet.scalar() or 0.0)

        # Find matching VIP Level
        q_vip = select(VIPLevel).where(
            VIPLevel.min_wager <= tot_wager,
            VIPLevel.min_deposit <= tot_dep
        ).order_by(VIPLevel.level_number.desc())
        res_vip = await self.db.execute(q_vip)
        new_vip = res_vip.scalars().first()

        if new_vip and (not user.vip_level_id or user.vip_level_id != new_vip.id):
            old_level_id = user.vip_level_id
            user.vip_level_id = new_vip.id
            
            # Apply tier level bonus credit
            if new_vip.monthly_bonus > 0:
                wallet = await self.wallet_repo.get_by_user_id_with_lock(user_id)
                if wallet:
                    wallet.bonus_balance = float(Decimal(str(wallet.bonus_balance)) + Decimal(str(new_vip.monthly_bonus)))
                    
                    await self.wallet_repo.create_transaction(
                        wallet_id=wallet.id,
                        amount=float(new_vip.monthly_bonus),
                        wallet_type="bonus",
                        transaction_type="bonus_credit",
                        description=f"VIP Level Up: Welcome to {new_vip.level_name} Tier!"
                    )

            # Trigger in-app notification
            from app.models.notifications import Notification
            notif = Notification(
                user_id=user_id,
                title="🏆 VIP Level Upgraded!",
                message=f"Congratulations! You have reached VIP Level: {new_vip.level_name}. Enjoy higher daily withdrawal limits and premium rewards.",
                type="system"
            )
            self.db.add(notif)
            await self.db.flush()
            return new_vip

        return None
