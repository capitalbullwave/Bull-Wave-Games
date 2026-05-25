from typing import Dict, List, Any
from fastapi import WebSocket, WebSocketDisconnect
import json

from app.core.security import verify_token

class ConnectionManager:
    def __init__(self):
        # Maps user_id -> List of active WebSocket connections (handles multi-device connections)
        self.active_connections: Dict[int, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, token: str) -> bool:
        """
        Authenticates connection and upgrades protocol on success.
        """
        # 1. Verify token
        payload = verify_token(token)
        if not payload or payload.get("type") != "access":
            await websocket.close(code=4001)  # Unauthorized
            return False

        try:
            user_id = int(payload["sub"])
        except (ValueError, KeyError):
            await websocket.close(code=4002)
            return False

        # 2. Accept connection
        await websocket.accept()
        
        # 3. Add connection map
        if user_id not in self.active_connections:
            self.active_connections[user_id] = []
        self.active_connections[user_id].append(websocket)
        
        # Keep track of user_id on connection metadata
        websocket.scope["user_id"] = user_id
        return True

    def disconnect(self, websocket: WebSocket):
        user_id = websocket.scope.get("user_id")
        if user_id and user_id in self.active_connections:
            self.active_connections[user_id].remove(websocket)
            if not self.active_connections[user_id]:
                del self.active_connections[user_id]

    async def send_personal_message(self, message: Dict[str, Any], user_id: int):
        """
        Sends targeted real-time events (e.g. balance_update, individual notification).
        """
        connections = self.active_connections.get(user_id, [])
        for ws in connections:
            try:
                await ws.send_text(json.dumps(message))
            except Exception:
                # Connection is broken, will be collected on next disconnect
                pass

    async def broadcast(self, message: Dict[str, Any]):
        """
        Broadcasts global updates (e.g. winner_feed, game results, leaderboard changes) to all clients.
        """
        for user_id, connections in list(self.active_connections.items()):
            for ws in connections:
                try:
                    await ws.send_text(json.dumps(message))
                except Exception:
                    pass

# Singleton manager instance
ws_manager = ConnectionManager()
