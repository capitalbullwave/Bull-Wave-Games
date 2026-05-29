import logging
from typing import List, Dict, Any, Tuple
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, func, update
from fastapi import HTTPException, status
from decimal import Decimal
from datetime import datetime, timezone

from app.models.rebates import RebateCategory, VIPRebateRate, UserRebateBalance, RebateTransaction, RebateClaimHistory
from app.models.vip_and_audit import VIPLevel
from app.models.games import Game
from app.models.users import User
from app.schemas.rebates import RebateDashboardResponse, RebateCategoryStats, RebateHistoryItem, RebateClaimHistoryItem

logger = logging.getLogger(__name__)

class RebateService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_dashboard(self, user_id: int) -> RebateDashboardResponse:
        """Fetch dashboard statistics for a user."""
        # Get user's VIP level
        user = await self.db.get(User, user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
            
        vip_level = 0
        if user.vip_level_id:
            vip_record = await self.db.get(VIPLevel, user.vip_level_id)
            if vip_record:
                vip_level = vip_record.level_number

        # Fetch all active categories
        stmt_cats = select(RebateCategory).where(RebateCategory.is_active == True)
        result_cats = await self.db.execute(stmt_cats)
        all_categories = result_cats.scalars().all()

        # Fetch user's balances
        stmt_bals = select(UserRebateBalance).where(UserRebateBalance.user_id == user_id)
        result_bals = await self.db.execute(stmt_bals)
        user_balances = {bal.category_id: bal for bal in result_bals.scalars().all()}

        total_available = Decimal("0.00")
        total_today = Decimal("0.00")
        total_lifetime = Decimal("0.00")
        categories_stats = []

        for cat in all_categories:
            bal = user_balances.get(cat.id)
            
            avail = bal.available_rebate if bal else 0.00
            today = bal.today_rebate if bal else 0.00
            lifetime = bal.total_rebate if bal else 0.00
            turnover = bal.today_turnover if bal else 0.00
            
            total_available += Decimal(str(avail))
            total_today += Decimal(str(today))
            total_lifetime += Decimal(str(lifetime))
            
            categories_stats.append(RebateCategoryStats(
                name=cat.name,
                code=cat.code,
                turnover=float(turnover),
                rebate=float(today),
                available_rebate=float(avail)
            ))

        return RebateDashboardResponse(
            availableRebate=float(total_available),
            todayRebate=float(total_today),
            totalRebate=float(total_lifetime),
            vipLevel=vip_level,
            categories=categories_stats
        )

    async def claim_rebate(self, user_id: int) -> float:
        """Claims all available rebate for the user and credits it to wallet."""
        from app.services.wallet_service import WalletService
        
        # Calculate total available rebate
        stmt = select(func.sum(UserRebateBalance.available_rebate)).where(
            and_(UserRebateBalance.user_id == user_id, UserRebateBalance.available_rebate > 0)
        )
        result = await self.db.execute(stmt)
        total_available = result.scalar() or 0.0
        
        if total_available <= 0:
            raise HTTPException(status_code=400, detail="No rebate available to claim")

        # Zero out available rebate
        update_stmt = (
            update(UserRebateBalance)
            .where(UserRebateBalance.user_id == user_id)
            .values(available_rebate=0)
        )
        await self.db.execute(update_stmt)

        # Create claim history
        claim_history = RebateClaimHistory(
            user_id=user_id,
            amount=total_available,
            status="completed"
        )
        self.db.add(claim_history)

        # Credit wallet
        wallet_srv = WalletService(self.db)
        await wallet_srv.add_bonus_balance(user_id, float(total_available), "REBATE_BONUS", "Rebate Claim")

        await self.db.commit()
        return float(total_available)

    async def process_bet_rebate(self, user_id: int, bet_amount: float, game_id: int):
        """Processes rebate logic when a bet is placed."""
        if bet_amount <= 0:
            return

        # Fetch Game to find Category
        game = await self.db.get(Game, game_id)
        if not game or not game.category_id:
            return

        # Fetch user's VIP Level
        user = await self.db.get(User, user_id)
        if not user or not user.vip_level_id:
            return

        # Find Rebate Percentage
        stmt = select(VIPRebateRate).where(
            and_(
                VIPRebateRate.vip_level_id == user.vip_level_id,
                VIPRebateRate.category_id == game.category_id
            )
        )
        result = await self.db.execute(stmt)
        rate = result.scalars().first()

        if not rate or float(rate.rebate_percentage) <= 0:
            return

        rebate_amount = bet_amount * (float(rate.rebate_percentage) / 100)

        # Fetch or Create UserRebateBalance
        stmt = select(UserRebateBalance).where(
            and_(
                UserRebateBalance.user_id == user_id,
                UserRebateBalance.category_id == game.category_id
            )
        )
        result = await self.db.execute(stmt)
        balance = result.scalars().first()

        if not balance:
            balance = UserRebateBalance(
                user_id=user_id,
                category_id=game.category_id,
                today_turnover=0,
                today_rebate=0,
                total_rebate=0,
                available_rebate=0
            )
            self.db.add(balance)
            await self.db.flush()

        # Update balances
        balance.today_turnover = float(balance.today_turnover) + bet_amount
        balance.today_rebate = float(balance.today_rebate) + rebate_amount
        balance.total_rebate = float(balance.total_rebate) + rebate_amount
        balance.available_rebate = float(balance.available_rebate) + rebate_amount

        # Add transaction
        transaction = RebateTransaction(
            user_id=user_id,
            category_id=game.category_id,
            bet_amount=bet_amount,
            rebate_percentage=rate.rebate_percentage,
            rebate_amount=rebate_amount
        )
        self.db.add(transaction)
        await self.db.flush()

    async def get_claim_history(self, user_id: int, skip: int = 0, limit: int = 20) -> List[RebateClaimHistoryItem]:
        from app.schemas.rebates import RebateClaimHistoryItem
        stmt = (
            select(RebateClaimHistory)
            .where(RebateClaimHistory.user_id == user_id)
            .order_by(RebateClaimHistory.claimed_at.desc())
            .offset(skip)
            .limit(limit)
        )
        result = await self.db.execute(stmt)
        return [RebateClaimHistoryItem.model_validate(x) for x in result.scalars().all()]
        
    async def get_transaction_history(self, user_id: int, skip: int = 0, limit: int = 20) -> List[RebateHistoryItem]:
        stmt = (
            select(RebateTransaction, RebateCategory)
            .join(RebateCategory, RebateTransaction.category_id == RebateCategory.id)
            .where(RebateTransaction.user_id == user_id)
            .order_by(RebateTransaction.created_at.desc())
            .offset(skip)
            .limit(limit)
        )
        result = await self.db.execute(stmt)
        
        history = []
        for txn, cat in result.all():
            history.append(RebateHistoryItem(
                amount=float(txn.rebate_amount),
                category=cat.name,
                date=txn.created_at
            ))
        return history

    async def reset_daily_rebates(self):
        """Cron job hook to reset today_rebate and today_turnover."""
        stmt = update(UserRebateBalance).values(
            today_rebate=0,
            today_turnover=0
        )
        await self.db.execute(stmt)
        await self.db.commit()
        logger.info("Daily rebate turnovers and rebates have been reset.")
