from datetime import datetime
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, delete
from fastapi import HTTPException, status
import logging

from app.models.activities import ActivityTask, UserActivityProgress, ActivityRewardHistory, ActivityType
from app.schemas.activities import ActivityTaskCreate, ActivityTaskUpdate, ActivityListResponse, ActivityProgressResponse
from app.services.wallet_service import WalletService

logger = logging.getLogger(__name__)

class ActivityService:
    def __init__(self, db: AsyncSession):
        self.db = db

    # ---------------- Admin Methods ----------------

    async def create_task(self, task_data: ActivityTaskCreate) -> ActivityTask:
        task = ActivityTask(**task_data.model_dump())
        self.db.add(task)
        await self.db.flush()
        return task

    async def update_task(self, task_id: int, task_data: ActivityTaskUpdate) -> ActivityTask:
        query = select(ActivityTask).where(ActivityTask.id == task_id)
        result = await self.db.execute(query)
        task = result.scalars().first()
        if not task:
            raise HTTPException(status_code=404, detail="Task not found")
        
        update_data = task_data.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(task, key, value)
        
        await self.db.flush()
        return task

    async def delete_task(self, task_id: int) -> None:
        query = select(ActivityTask).where(ActivityTask.id == task_id)
        result = await self.db.execute(query)
        task = result.scalars().first()
        if not task:
            raise HTTPException(status_code=404, detail="Task not found")
        
        await self.db.delete(task)
        await self.db.flush()

    async def get_all_tasks(self) -> List[ActivityTask]:
        query = select(ActivityTask).order_by(ActivityTask.created_at.desc())
        result = await self.db.execute(query)
        return list(result.scalars().all())

    # ---------------- User Methods ----------------

    async def get_user_activities(self, user_id: int) -> ActivityListResponse:
        # Fetch active tasks
        tasks_query = select(ActivityTask).where(ActivityTask.is_active == True).order_by(ActivityTask.id)
        tasks_result = await self.db.execute(tasks_query)
        tasks = tasks_result.scalars().all()

        # Fetch user progress for these tasks
        task_ids = [t.id for t in tasks]
        progress_dict = {}
        if task_ids:
            prog_query = select(UserActivityProgress).where(
                UserActivityProgress.user_id == user_id,
                UserActivityProgress.task_id.in_(task_ids)
            )
            prog_result = await self.db.execute(prog_query)
            for p in prog_result.scalars().all():
                progress_dict[p.task_id] = p

        activities_res = []
        today_bonus = 0.0
        total_bonus = 0.0

        for t in tasks:
            prog = progress_dict.get(t.id)
            current_amt = prog.current_amount if prog else 0.0
            completed = prog.completed if prog else False
            claimed = prog.claimed if prog else False

            activities_res.append(ActivityProgressResponse(
                id=t.id,
                title=t.title,
                targetAmount=t.target_amount,
                currentAmount=current_amt,
                rewardAmount=t.reward_amount,
                completed=completed,
                claimed=claimed,
                activity_type=t.activity_type,
                is_active=t.is_active
            ))

            if completed and claimed:
                total_bonus += t.reward_amount
                # Crude check for today's bonus. Ideal would check claimed_at in history.
                # Assuming simple total bonus logic for now.

        # To accurately get today's bonus, check history:
        today_start = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
        hist_query = select(ActivityRewardHistory).where(
            ActivityRewardHistory.user_id == user_id,
            ActivityRewardHistory.claimed_at >= today_start
        )
        hist_result = await self.db.execute(hist_query)
        for h in hist_result.scalars().all():
            today_bonus += h.reward_amount

        # For total bonus, let's sum all histories for user
        total_hist_query = select(ActivityRewardHistory).where(ActivityRewardHistory.user_id == user_id)
        total_hist_result = await self.db.execute(total_hist_query)
        total_bonus = sum(h.reward_amount for h in total_hist_result.scalars().all())

        return ActivityListResponse(
            todayBonus=today_bonus,
            totalBonus=total_bonus,
            activities=activities_res
        )

    async def add_bet_progress(self, user_id: int, bet_amount: float) -> None:
        """Called automatically when user places a bet."""
        # Find all active tasks
        tasks_query = select(ActivityTask).where(ActivityTask.is_active == True)
        tasks_result = await self.db.execute(tasks_query)
        tasks = tasks_result.scalars().all()

        if not tasks:
            return

        # Get existing progress
        task_ids = [t.id for t in tasks]
        prog_query = select(UserActivityProgress).where(
            UserActivityProgress.user_id == user_id,
            UserActivityProgress.task_id.in_(task_ids)
        )
        prog_result = await self.db.execute(prog_query)
        progress_records = {p.task_id: p for p in prog_result.scalars().all()}

        for t in tasks:
            prog = progress_records.get(t.id)
            if not prog:
                prog = UserActivityProgress(
                    user_id=user_id,
                    task_id=t.id,
                    current_amount=0.0,
                    completed=False,
                    claimed=False
                )
                self.db.add(prog)
            
            # If not completed, increment
            if not prog.completed:
                prog.current_amount += bet_amount
                if prog.current_amount >= t.target_amount:
                    prog.completed = True
                    prog.current_amount = t.target_amount

        await self.db.flush()

    async def claim_reward(self, user_id: int, task_id: int) -> None:
        # Load progress
        prog_query = select(UserActivityProgress).where(
            UserActivityProgress.user_id == user_id,
            UserActivityProgress.task_id == task_id
        ).with_for_update()
        prog_result = await self.db.execute(prog_query)
        prog = prog_result.scalars().first()

        if not prog:
            raise HTTPException(status_code=400, detail="Progress not found")
        if not prog.completed:
            raise HTTPException(status_code=400, detail="Task is not completed yet")
        if prog.claimed:
            raise HTTPException(status_code=400, detail="Reward already claimed")

        # Load task
        task_query = select(ActivityTask).where(ActivityTask.id == task_id)
        task_result = await self.db.execute(task_query)
        task = task_result.scalars().first()
        
        if not task or not task.is_active:
            raise HTTPException(status_code=400, detail="Task is inactive or not found")

        # Mark claimed
        prog.claimed = True

        # Credit wallet
        wallet_srv = WalletService(self.db)
        await wallet_srv.add_activity_reward(user_id=user_id, amount=task.reward_amount, task_id=task.id)

        # Log history
        history = ActivityRewardHistory(
            user_id=user_id,
            task_id=task.id,
            reward_amount=task.reward_amount
        )
        self.db.add(history)
        await self.db.flush()

    # ---------------- Reset Methods (Cron) ----------------

    async def reset_tasks(self, activity_type: ActivityType) -> None:
        """Reset current_amount, completed, claimed for tasks of given type"""
        tasks_query = select(ActivityTask.id).where(ActivityTask.activity_type == activity_type)
        tasks_result = await self.db.execute(tasks_query)
        task_ids = [row for row in tasks_result.scalars().all()]
        
        if not task_ids:
            return
            
        stmt = (
            update(UserActivityProgress)
            .where(UserActivityProgress.task_id.in_(task_ids))
            .values(current_amount=0.0, completed=False, claimed=False)
        )
        await self.db.execute(stmt)
        await self.db.flush()
        logger.info(f"Reset {len(task_ids)} tasks of type {activity_type}")
