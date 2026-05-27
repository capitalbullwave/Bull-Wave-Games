from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Any, List
from datetime import datetime, timezone, timedelta

from app.core.database import get_async_db
from app.schemas.tournaments import LeaderboardEntryResponse, WinnerFeedResponse
from app.models.tournaments import Leaderboard
from app.models.users import User
from app.models.games import Bet, Game

router = APIRouter()

@router.get("/", response_model=List[LeaderboardEntryResponse])
async def get_leaderboard(
    type: str = "daily",  # daily, weekly, monthly, all_time
    db: AsyncSession = Depends(get_async_db)
) -> Any:
    # We query the leaderboard records
    query = (
        select(Leaderboard, User.username)
        .join(User, Leaderboard.user_id == User.id)
        .where(Leaderboard.type == type)
        .order_by(Leaderboard.rank.asc())
        .limit(50)
    )
    result = await db.execute(query)
    
    entries = []
    for row in result.all():
        leaderboard_item = row[0]
        username = row[1]
        entries.append({
            "rank": leaderboard_item.rank,
            "username": username,
            "score": float(leaderboard_item.score),
            "date_reference": leaderboard_item.date_reference
        })
        
    # If no records exist, we generate simulated dummy leaderboard entries to populate UI
    if not entries:
        mock_usernames = ["JackpotKing", "BullRider", "WaveChaser", "DamanPro", "LuckySpin", "BetMaster", "CoinCollector", "GoldHunter"]
        for idx, name in enumerate(mock_usernames):
            entries.append({
                "rank": idx + 1,
                "username": name,
                "score": float(15000.00 / (idx + 1)),
                "date_reference": "current_period"
            })
            
    return entries

@router.get("/winner-feed", response_model=List[WinnerFeedResponse])
async def get_winner_feed(
    db: AsyncSession = Depends(get_async_db)
) -> Any:
    """
    Fetches the 20 most recent high-winning settlements to power the winner ticker.
    """
    query = (
        select(Bet, User.username, Game.name)
        .join(User, Bet.user_id == User.id)
        .join(Game, Bet.game_id == Game.id)
        .where(Bet.status == "won")
        .order_by(Bet.settled_at.desc())
        .limit(20)
    )
    result = await db.execute(query)
    
    feed = []
    for row in result.all():
        bet, username, game_name = row
        feed.append({
            "username": f"{username[:3]}***{username[-2:]}" if len(username) > 4 else "***",
            "game_name": game_name,
            "payout_amount": float(bet.payout_amount),
            "created_at": bet.settled_at or datetime.now()
        })
        
    # Fallback to realistic mock winners
    if not feed:
        mock_data = [
            ("DamanPlay", "Color Prediction Lottery", 450.00),
            ("GamerX", "Evolution Roulette", 1200.00),
            ("RichMan", "Pragmatic Sweet Bonanza", 3500.00),
            ("AviatorFlyer", "Spribe Aviator Crash", 980.00),
            ("ReferralBoss", "MLM Commissions Hub", 150.00)
        ]
        for name, game, payout in mock_data:
            feed.append({
                "username": f"{name[:3]}***{name[-2:]}",
                "game_name": game,
                "payout_amount": payout,
                "created_at": datetime.now() - timedelta(minutes=5)
            })
            
    return feed
