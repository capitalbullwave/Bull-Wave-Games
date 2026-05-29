import logging
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from sqlalchemy.ext.asyncio import AsyncSession
import asyncio

from app.core.database import SessionLocal
from app.models.activities import ActivityType
from app.services.activity_service import ActivityService

logger = logging.getLogger(__name__)
scheduler = AsyncIOScheduler()

async def reset_activities(activity_type: ActivityType):
    """Job to reset activities based on type."""
    logger.info(f"Starting {activity_type} activity reset...")
    async with SessionLocal() as db:
        srv = ActivityService(db)
        await srv.reset_tasks(activity_type)
    logger.info(f"Finished {activity_type} activity reset.")

def setup_scheduler():
    # Reset daily tasks at 00:00 every day
    scheduler.add_job(
        reset_activities,
        trigger=CronTrigger(hour=0, minute=0),
        args=[ActivityType.DAILY],
        id="reset_daily_activities",
        replace_existing=True
    )
    
    # Reset weekly tasks on Monday at 00:00
    scheduler.add_job(
        reset_activities,
        trigger=CronTrigger(day_of_week='mon', hour=0, minute=0),
        args=[ActivityType.WEEKLY],
        id="reset_weekly_activities",
        replace_existing=True
    )
    
    # Reset monthly tasks on the 1st day of the month at 00:00
    scheduler.add_job(
        reset_activities,
        trigger=CronTrigger(day=1, hour=0, minute=0),
        args=[ActivityType.MONTHLY],
        id="reset_monthly_activities",
        replace_existing=True
    )
    
    # Reset daily rebates at 01:00 AM
    async def run_rebate_reset():
        logger.info("Starting Daily Rebate Reset...")
        async with SessionLocal() as db:
            from app.services.rebate_service import RebateService
            srv = RebateService(db)
            await srv.reset_daily_rebates()
        logger.info("Finished Daily Rebate Reset.")
        
    scheduler.add_job(
        run_rebate_reset,
        trigger=CronTrigger(hour=1, minute=0),
        id="reset_daily_rebates",
        replace_existing=True
    )
    
    scheduler.start()
    logger.info("Activity Scheduler started.")
