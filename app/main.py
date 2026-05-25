# Main Entrypoint for Bull Wave Games API backend
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Query, status
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import time

from app.core.config import settings
from app.api.v1.api import api_router
from app.websocket.manager import ws_manager
from app.core.database import SessionLocal, Base, engine

# Startup Database Bootstrapping and Seeding
async def bootstrap_database():
    """
    Seeds default Game Categories, custom VIP levels and initial mock games on launch.
    """
    async with SessionLocal() as db:
        try:
            # Seed VIP Levels
            from app.models.vip_and_audit import VIPLevel
            from sqlalchemy import select
            
            res_vip = await db.execute(select(VIPLevel))
            if not res_vip.scalars().first():
                levels = [
                    VIPLevel(level_name="Bronze", level_number=0, min_wager=0, min_deposit=0, daily_withdrawal_limit=50000, monthly_bonus=0, referral_bonus_rate=1.0),
                    VIPLevel(level_name="Silver", level_number=1, min_wager=50000, min_deposit=5000, daily_withdrawal_limit=100000, monthly_bonus=500, referral_bonus_rate=1.05),
                    VIPLevel(level_name="Gold", level_number=2, min_wager=200000, min_deposit=20000, daily_withdrawal_limit=300000, monthly_bonus=2000, referral_bonus_rate=1.10),
                    VIPLevel(level_name="Platinum", level_number=3, min_wager=1000000, min_deposit=100000, daily_withdrawal_limit=1000000, monthly_bonus=10000, referral_bonus_rate=1.20)
                ]
                db.add_all(levels)
                await db.flush()

            # Seed Game Categories
            from app.models.games import GameCategory, Game
            res_cat = await db.execute(select(GameCategory))
            if not res_cat.scalars().first():
                cats = [
                    GameCategory(name="Lottery", slug="lottery"),
                    GameCategory(name="Casino", slug="casino"),
                    GameCategory(name="Slots", slug="slots"),
                    GameCategory(name="Sports", slug="sports"),
                    GameCategory(name="Card Games", slug="cards"),
                    GameCategory(name="Fishing", slug="fishing"),
                    GameCategory(name="Mini Games", slug="minigames")
                ]
                db.add_all(cats)
                await db.flush()

                # Seed mock games
                game1 = Game(category_id=1, name="Daman Color Prediction 3m", provider="internal", provider_game_id="daman_color_3m", is_active=True)
                game2 = Game(category_id=2, name="Evolution Live Roulette", provider="evolution", provider_game_id="evo_roulette", is_active=True)
                game3 = Game(category_id=3, name="Sweet Bonanza Slots", provider="pragmatic", provider_game_id="sweet_bonanza", is_active=True)
                db.add_all([game1, game2, game3])
                await db.flush()

            await db.commit()
            print("[Database Bootstrapper] Default VIP Levels and Game Catalog seeded successfully.")
        except Exception as e:
            await db.rollback()
            print(f"[Database Bootstrapper] Seeding failed: {e}")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Setup database schemas if tables don't exist
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    # Run seed bootstrapping
    await bootstrap_database()
    yield
    # Shutdown logic if any (e.g. close redis pools)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version="1.0.0",
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    lifespan=lifespan
)

# CORS configurations
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_origin_regex=r"https?://(localhost|127\.0\.0\.1)(:\d+)?",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Metric request logging middleware
@app.middleware("http")
async def log_requests(request, call_next):
    start_time = time.time()
    response = await call_next(request)
    duration = time.time() - start_time
    response.headers["X-Process-Time"] = str(duration)
    # Print clean structured log representation
    print(f"[HTTP] {request.method} {request.url.path} | Status: {response.status_code} | Duration: {duration:.4f}s")
    return response

# Main REST API Index Router binding
app.include_router(api_router, prefix=settings.API_V1_STR)

# WS Route upgrade endpoint for real-time events pub/sub
@app.websocket("/api/v1/ws")
async def websocket_endpoint(
    websocket: WebSocket,
    token: str = Query(...)
):
    # Verify token during protocol handshake
    accepted = await ws_manager.connect(websocket, token)
    if not accepted:
        return

    try:
        while True:
            # WebSockets keepalive pulse check
            # Read messages if frontend sends them (e.g., client commands)
            data = await websocket.receive_text()
            # Respond to ping/pong
            if data == "ping":
                await websocket.send_text("pong")
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket)
    except Exception:
        ws_manager.disconnect(websocket)
