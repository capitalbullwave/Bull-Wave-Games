from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Any, List, Optional
import secrets

from app.core.database import get_async_db
from app.core.deps import get_current_user, get_current_admin
from app.schemas.games import GameCategoryResponse, GameResponse, GameSessionLaunchResponse, BetCreate, BetResponse, ResultResponse
from app.models.games import GameCategory, Game, GameSession, Bet, Result
from app.services.wallet_service import WalletService

router = APIRouter()

@router.get("/categories", response_model=List[GameCategoryResponse])
async def list_categories(
    db: AsyncSession = Depends(get_async_db)
) -> Any:
    query = select(GameCategory).where(GameCategory.is_active == True)
    result = await db.execute(query)
    return list(result.scalars().all())

@router.get("/list", response_model=List[GameResponse])
async def list_games(
    category_id: Optional[int] = None,
    db: AsyncSession = Depends(get_async_db)
) -> Any:
    query = select(Game).where(Game.is_active == True)
    if category_id:
        query = query.where(Game.category_id == category_id)
    result = await db.execute(query)
    return list(result.scalars().all())

@router.post("/launch/{game_id}", response_model=GameSessionLaunchResponse)
async def launch_game(
    game_id: int,
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db)
) -> Any:
    # Verify game exists
    query = select(Game).where(Game.id == game_id, Game.is_active == True)
    result = await db.execute(query)
    game = result.scalars().first()
    if not game:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Game not found or inactive")

    # Deactivate older sessions
    from sqlalchemy import update
    await db.execute(
        update(GameSession).where(
            GameSession.user_id == current_user.id,
            GameSession.game_id == game_id,
            GameSession.is_active == True
        ).values(is_active=False)
    )

    # Generate session token
    token = f"BW_SESSION_{secrets.token_hex(16).upper()}"
    session = GameSession(
        user_id=current_user.id,
        game_id=game_id,
        session_token=token,
        is_active=True
    )
    db.add(session)
    await db.commit()

    return {
        "session_token": token,
        "launch_url": f"https://play.bullwavegames.com/game/{game.provider_game_id or game_id}?token={token}"
    }

@router.post("/bet", response_model=BetResponse)
async def place_bet(
    schema: BetCreate,
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db)
) -> Any:
    # Verify game
    query = select(Game).where(Game.id == schema.game_id, Game.is_active == True)
    result = await db.execute(query)
    game = result.scalars().first()
    if not game:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Game not found or inactive")

    wallet_srv = WalletService(db)
    bet = await wallet_srv.place_bet(
        user_id=current_user.id,
        game_id=schema.game_id,
        amount=schema.bet_amount,
        wallet_type=schema.wallet_type,
        prediction=schema.prediction
    )
    await db.commit()
    return bet

@router.post("/settle", response_model=BetResponse)
async def mock_settle_bet(
    bet_id: int,
    status: str,  # won, lost
    payout_amount: float = 0.00,
    db: AsyncSession = Depends(get_async_db)
) -> Any:
    """
    Mock settlement endpoint representing Evolution/Pragmatic webhook trigger.
    In production, this would be highly authenticated and secure.
    """
    wallet_srv = WalletService(db)
    if status == "won":
        bet = await wallet_srv.settle_win(bet_id, payout_amount)
    else:
        bet = await wallet_srv.settle_loss(bet_id)
        
    await db.commit()
    
    # Broadcast to dynamic WebSocket Result Feed in main thread
    # Real-time message would be sent here
    return bet
