import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_wallet_flow(client: AsyncClient):
    # 1. Register & Login
    register_payload = {
        "username": "walletplayer",
        "mobile": "+918888888888",
        "email": "walletplayer@bullwave.com",
        "password": "securepassword123"
    }
    await client.post("/api/v1/auth/register", json=register_payload)

    login_payload = {
        "username_or_mobile": "walletplayer",
        "password": "securepassword123"
    }
    response = await client.post("/api/v1/auth/login", json=login_payload)
    token_data = response.json()
    headers = {"Authorization": f"Bearer {token_data['access_token']}"}

    # 2. Get initial balance (should be all 0.00)
    response = await client.get("/api/v1/wallet/balance", headers=headers)
    assert response.status_code == 200
    balances = response.json()
    assert float(balances["main_balance"]) == 0.00
    assert float(balances["bonus_balance"]) == 0.00

    # 3. Initiate a mock deposit
    deposit_payload = {
        "amount": 500.00,
        "gateway": "razorpay"
    }
    response = await client.post("/api/v1/wallet/deposit", json=deposit_payload, headers=headers)
    assert response.status_code == 200
    dep_data = response.json()
    assert dep_data["amount"] == 500.00
    assert dep_data["status"] == "pending"
    assert "checkout_url" in dep_data

    # 4. Attempt to place a bet (should fail due to insufficient funds since deposit is pending)
    bet_payload = {
        "game_id": 1,
        "bet_amount": 100.00,
        "wallet_type": "main"
    }
    response = await client.post("/api/v1/games/bet", json=bet_payload, headers=headers)
    assert response.status_code == 400
    assert "Insufficient funds" in response.json()["detail"]
