from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Any, List
from decimal import Decimal

from app.core.database import get_async_db
from app.core.deps import get_current_user
from app.schemas.tournaments import TournamentResponse, TournamentJoinResponse, LeaderboardEntryResponse
from app.models.tournaments import Tournament, TournamentParticipant
from app.repositories.wallet_repository import WalletRepository

router = APIRouter()

@router.get("/list", response_model=List[TournamentResponse])
async def list_tournaments(
    db: AsyncSession = Depends(get_async_db)
) -> Any:
    query = select(Tournament).order_by(Tournament.starts_at.asc())
    result = await db.execute(query)
    return list(result.scalars().all())

@router.post("/join/{tournament_id}", response_model=TournamentJoinResponse)
async def join_tournament(
    tournament_id: int,
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db)
) -> Any:
    # 1. Fetch tournament
    query = select(Tournament).where(Tournament.id == tournament_id)
    result = await db.execute(query)
    tournament = result.scalars().first()
    if not tournament:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tournament not found")

    if tournament.status != "upcoming" and tournament.status != "active":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Tournament is not open for joining")

    # 2. Check if already joined
    q_joined = select(TournamentParticipant).where(
        TournamentParticipant.tournament_id == tournament_id,
        TournamentParticipant.user_id == current_user.id
    )
    res_joined = await db.execute(q_joined)
    if res_joined.scalars().first():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="You have already joined this tournament")

    # 3. Deduct entry fee
    if tournament.entry_fee > 0:
        wallet_repo = WalletRepository(db)
        wallet = await wallet_repo.get_by_user_id_with_lock(current_user.id)
        if not wallet or wallet.is_frozen:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Wallet locked or unavailable")

        main_dec = Decimal(str(wallet.main_balance))
        fee_dec = Decimal(str(tournament.entry_fee))
        if main_dec < fee_dec:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Insufficient funds in main wallet for entry fee")

        wallet.main_balance = float(main_dec - fee_dec)
        await wallet_repo.create_transaction(
            wallet_id=wallet.id,
            amount=-float(tournament.entry_fee),
            wallet_type="main",
            transaction_type="bet_placed",
            description=f"Entry fee for Tournament: {tournament.title}"
        )

    # 4. Add Participant
    participant = TournamentParticipant(
        tournament_id=tournament_id,
        user_id=current_user.id,
        score=0.00
    )
    db.add(participant)
    tournament.current_participants += 1
    
    await db.commit()
    
    return {
        "message": "Successfully joined tournament",
        "joined_at": participant.joined_at,
        "tournament_id": tournament_id
    }
