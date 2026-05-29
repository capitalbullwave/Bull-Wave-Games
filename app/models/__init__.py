from app.core.database import Base
from app.models.users import User, UserSession, OTPLog, Profile, KYCRecord, BankAccount
from app.models.wallets import Wallet, WalletTransaction, Deposit, Withdrawal, PaymentLog
from app.models.games import GameCategory, Game, GameSession, Bet, Result
from app.models.tournaments import Tournament, TournamentParticipant, Leaderboard
from app.models.referrals import Referral, ReferralCommission
from app.models.rewards import Reward, Coupon
from app.models.notifications import Notification
from app.models.support import SupportTicket, TicketMessage
from app.models.vip_and_audit import VIPLevel, AuditLog
from app.models.activities import ActivityTask, UserActivityProgress, ActivityRewardHistory
from app.models.invitations import InvitationBonusLevel, UserInvitationProgress, InvitationRewardHistory
from app.models.rebates import RebateCategory, VIPRebateRate, UserRebateBalance, RebateTransaction, RebateClaimHistory
from app.models.super_jackpots import UserSuperJackpot
from app.models.first_gift import FirstGiftClaim

__all__ = [
    "Base",
    "User",
    "UserSession",
    "OTPLog",
    "Profile",
    "KYCRecord",
    "BankAccount",
    "Wallet",
    "WalletTransaction",
    "Deposit",
    "Withdrawal",
    "PaymentLog",
    "GameCategory",
    "Game",
    "GameSession",
    "Bet",
    "Result",
    "Tournament",
    "TournamentParticipant",
    "Leaderboard",
    "Referral",
    "ReferralCommission",
    "Reward",
    "Coupon",
    "Notification",
    "SupportTicket",
    "TicketMessage",
    "VIPLevel",
    "AuditLog",
    "ActivityTask",
    "UserActivityProgress",
    "ActivityRewardHistory",
    "InvitationBonusLevel",
    "UserInvitationProgress",
    "InvitationRewardHistory",
    "RebateCategory",
    "VIPRebateRate",
    "UserRebateBalance",
    "RebateTransaction",
    "RebateClaimHistory",
    "UserSuperJackpot",
    "FirstGiftClaim"
]
