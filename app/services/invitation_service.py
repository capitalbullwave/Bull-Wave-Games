from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, func
from datetime import datetime, timezone
from typing import List, Optional

from app.models.invitations import InvitationBonusLevel, UserInvitationProgress, InvitationRewardHistory
from app.models.referrals import Referral
from app.models.wallets import Wallet
from app.repositories.wallet_repository import WalletRepository

class InvitationService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.wallet_repo = WalletRepository(db)

    async def get_all_levels(self) -> List[InvitationBonusLevel]:
        query = select(InvitationBonusLevel).order_by(InvitationBonusLevel.level.asc())
        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def get_user_progress(self, user_id: int) -> List[UserInvitationProgress]:
        # Ensure progress records exist for all active levels
        levels = await self.get_all_levels()
        query = select(UserInvitationProgress).where(UserInvitationProgress.user_id == user_id)
        result = await self.db.execute(query)
        existing_progress = result.scalars().all()
        existing_level_ids = {p.level_id for p in existing_progress}

        # Create missing progress records
        missing_records = False
        for lvl in levels:
            if lvl.id not in existing_level_ids and lvl.is_active:
                new_prog = UserInvitationProgress(
                    user_id=user_id,
                    level_id=lvl.id,
                    completed_invites=0,
                    completed_deposits=0,
                    reward_unlocked=False,
                    reward_claimed=False
                )
                self.db.add(new_prog)
                missing_records = True
        
        if missing_records:
            await self.db.flush()
            # Re-fetch after creation
            result = await self.db.execute(select(UserInvitationProgress).where(UserInvitationProgress.user_id == user_id))
            existing_progress = result.scalars().all()
            
        # To populate .level relation
        for p in existing_progress:
            await self.db.refresh(p, ["level"])
            
        return list(existing_progress)

    async def get_user_history(self, user_id: int) -> List[InvitationRewardHistory]:
        query = select(InvitationRewardHistory).where(InvitationRewardHistory.user_id == user_id).order_by(InvitationRewardHistory.claimed_at.desc())
        result = await self.db.execute(query)
        records = result.scalars().all()
        for r in records:
            if r.level_id:
                await self.db.refresh(r, ["level"])
        return list(records)

    async def process_first_deposit(self, referee_id: int, deposit_amount: float):
        """
        Called when a user makes a successful deposit.
        Checks if it's their first deposit and if they were referred.
        """
        # Find if this user was referred directly (level 1)
        query = select(Referral).where(Referral.referee_id == referee_id, Referral.level == 1)
        result = await self.db.execute(query)
        referral = result.scalars().first()

        if not referral:
            return # User wasn't referred
            
        if referral.first_deposit_completed:
            return # Already completed first deposit logic
            
        # Log the first deposit amount
        referral.first_deposit_amount = deposit_amount
        
        if float(deposit_amount) >= 500.0:
            referral.first_deposit_completed = True
            referral.status = "completed"
            
            # Update referrer's progress
            referrer_id = referral.referrer_id
            await self.update_referrer_progress(referrer_id)
            
        await self.db.flush()

    async def update_referrer_progress(self, referrer_id: int):
        # Calculate total completed invites (first deposit >= 500)
        query_count = select(func.count(Referral.id)).where(
            Referral.referrer_id == referrer_id, 
            Referral.level == 1,
            Referral.first_deposit_completed == True
        )
        res_count = await self.db.execute(query_count)
        completed_count = res_count.scalar() or 0
        
        # Get all active levels
        levels = await self.get_all_levels()
        
        # Update progress
        for lvl in levels:
            if not lvl.is_active:
                continue
                
            # Get or create progress
            prog_q = select(UserInvitationProgress).where(
                UserInvitationProgress.user_id == referrer_id,
                UserInvitationProgress.level_id == lvl.id
            )
            prog_res = await self.db.execute(prog_q)
            progress = prog_res.scalars().first()
            
            if not progress:
                progress = UserInvitationProgress(
                    user_id=referrer_id,
                    level_id=lvl.id,
                )
                self.db.add(progress)
                
            progress.completed_invites = completed_count
            progress.completed_deposits = completed_count # Since condition is just invites with deposit
            
            if progress.completed_invites >= lvl.required_invites and not progress.reward_unlocked:
                progress.reward_unlocked = True
                
        await self.db.flush()

    async def claim_reward(self, user_id: int, level_id: int) -> float:
        # Get progress
        query = select(UserInvitationProgress).where(
            UserInvitationProgress.user_id == user_id,
            UserInvitationProgress.level_id == level_id
        )
        result = await self.db.execute(query)
        progress = result.scalars().first()
        
        if not progress:
            raise ValueError("Progress not found")
            
        if not progress.reward_unlocked:
            raise ValueError("Reward not yet unlocked")
            
        if progress.reward_claimed:
            raise ValueError("Reward already claimed")
            
        await self.db.refresh(progress, ["level"])
        lvl = progress.level
        
        if not lvl or not lvl.is_active:
            raise ValueError("Bonus level is inactive or does not exist")
            
        reward_amount = float(lvl.reward_amount)
        
        # Credit wallet (Adding to bonus_balance)
        wallet = await self.wallet_repo.get_by_user_id_with_lock(user_id)
        if not wallet:
            raise ValueError("Wallet not found")
            
        wallet.bonus_balance = float(wallet.bonus_balance) + reward_amount
        
        # Create wallet transaction
        await self.wallet_repo.create_transaction(
            wallet_id=wallet.id,
            amount=reward_amount,
            wallet_type="bonus",
            transaction_type="INVITATION_BONUS",
            description=f"Invitation Bonus Level {lvl.level}"
        )
        
        # Update progress
        progress.reward_claimed = True
        progress.claimed_at = datetime.now(timezone.utc)
        
        # Add history
        history = InvitationRewardHistory(
            user_id=user_id,
            level_id=level_id,
            amount=reward_amount
        )
        self.db.add(history)
        
        await self.db.flush()
        return reward_amount
