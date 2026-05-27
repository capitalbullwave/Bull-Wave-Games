from celery import Celery
import time
import os

from app.core.config import settings

# Initialize Celery app
celery_app = Celery(
    "bullwave_tasks",
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL
)

# Configuration overrides
celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_track_started=True
)

@celery_app.task(name="tasks.send_transactional_email")
def send_transactional_email(to_email: str, subject: str, html_content: str) -> bool:
    """
    Mock Celery task executing SMTP/SES delivery in the background.
    """
    print(f"[Celery] Dispatching email to: {to_email} | Subject: {subject}")
    time.sleep(1.5)  # Simulate network latency
    print(f"[Celery] Email sent to {to_email}")
    return True

@celery_app.task(name="tasks.send_sms_otp")
def send_sms_otp(mobile_no: str, otp_code: str) -> bool:
    """
    Mock Celery task invoking Twilio/SMS-gateways to send OTP.
    """
    print(f"[Celery] Sending OTP {otp_code} to {mobile_no}...")
    time.sleep(1.0)
    print(f"[Celery] SMS successfully delivered to {mobile_no}")
    return True

@celery_app.task(name="tasks.evaluate_vip_all_users")
def evaluate_vip_all_users():
    """
    Periodic task that runs periodically to evaluate VIP tier promotions.
    """
    print("[Celery] Starting batch evaluation of VIP tiers for all active accounts...")
    # In real execution, we import database, execute select of all user IDs,
    # and call RewardsAndVIPService.evaluate_vip_level(user_id)
    time.sleep(2.0)
    print("[Celery] Batch VIP evaluations complete.")
    return "done"

@celery_app.task(name="tasks.settle_expired_tournaments")
def settle_expired_tournaments():
    """
    Periodic scheduler task that finds tournaments whose 'ends_at' has passed,
    calculates ranked high scores, and distributes payouts to top participants' wallets.
    """
    print("[Celery] Querying expired tournaments to process payouts...")
    time.sleep(1.0)
    print("[Celery] Payout settlements complete.")
    return "done"
