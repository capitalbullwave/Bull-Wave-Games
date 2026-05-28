from fastapi import APIRouter

from app.api.v1.auth.auth import router as auth_router
from app.api.v1.users.users import router as users_router
from app.api.v1.wallet.wallet import router as wallet_router
from app.api.v1.admin.wallet import router as admin_wallet_router
from app.api.v1.payments.payments import router as payments_router
from app.api.v1.games.games import router as games_router
from app.api.v1.tournaments.tournaments import router as tournaments_router
from app.api.v1.leaderboard.leaderboard import router as leaderboard_router
from app.api.v1.referrals.referrals import router as referrals_router
from app.api.v1.rewards.rewards import router as rewards_router
from app.api.v1.notifications.notifications import router as notifications_router
from app.api.v1.support.support import router as support_router
from app.api.v1.history.history import router as history_router
from app.api.v1.vip.vip import router as vip_router
from app.api.v1.settings.settings import router as settings_router

api_router = APIRouter()

api_router.include_router(auth_router, prefix="/auth", tags=["Authentication"])
api_router.include_router(users_router, prefix="/users", tags=["Users"])
api_router.include_router(users_router, prefix="/profile", tags=["Profile"])  # Profile shares user endpoints mostly
api_router.include_router(wallet_router, prefix="/wallet", tags=["Wallet"])
api_router.include_router(admin_wallet_router, prefix="/admin/wallet", tags=["Admin Wallet"])
api_router.include_router(payments_router, prefix="/payments", tags=["Payments"])
api_router.include_router(games_router, prefix="/games", tags=["Games"])
api_router.include_router(tournaments_router, prefix="/tournaments", tags=["Tournaments"])
api_router.include_router(leaderboard_router, prefix="/leaderboard", tags=["Leaderboards"])
api_router.include_router(referrals_router, prefix="/referrals", tags=["Referrals"])
api_router.include_router(rewards_router, prefix="/rewards", tags=["Rewards"])
api_router.include_router(notifications_router, prefix="/notifications", tags=["Notifications"])
api_router.include_router(support_router, prefix="/support", tags=["Support"])
api_router.include_router(history_router, prefix="/history", tags=["Activity History"])
api_router.include_router(vip_router, prefix="/vip", tags=["VIP Club"])
api_router.include_router(settings_router, prefix="/settings", tags=["Preferences Settings"])
