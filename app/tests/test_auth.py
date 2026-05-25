import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_user_registration_and_login(client: AsyncClient):
    # 1. Register a new user
    register_payload = {
        "username": "testplayer",
        "mobile": "+919999999999",
        "email": "testplayer@bullwave.com",
        "password": "securepassword123"
    }
    
    response = await client.post("/api/v1/auth/register", json=register_payload)
    assert response.status_code == 201
    resp_data = response.json()
    assert resp_data["username"] == "testplayer"
    assert "referral_code" in resp_data

    # 2. Login with the registered user
    login_payload = {
        "username_or_mobile": "testplayer",
        "password": "securepassword123"
    }
    response = await client.post("/api/v1/auth/login", json=login_payload)
    assert response.status_code == 200
    token_data = response.json()
    assert "access_token" in token_data
    assert "refresh_token" in token_data
    assert token_data["token_type"] == "bearer"

    # 3. Access current user details (/me) using access token
    headers = {"Authorization": f"Bearer {token_data['access_token']}"}
    response = await client.get("/api/v1/users/me", headers=headers)
    assert response.status_code == 200
    profile_data = response.json()
    assert profile_data["username"] == "testplayer"
    assert profile_data["email"] == "testplayer@bullwave.com"
