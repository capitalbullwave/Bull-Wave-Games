import asyncio
import httpx

async def test_deposit():
    # First login to get token
    url = "http://127.0.0.1:8000/api/v1/auth/login"
    login_payload = {
        "username_or_mobile": "rohit123",
        "password": "temp_pass_will_set_later"
    }
    
    async with httpx.AsyncClient() as client:
        resp = await client.post(url, json=login_payload)
        token = resp.json()["access_token"]
        
        # Test deposit
        dep_url = "http://127.0.0.1:8000/api/v1/wallet/deposit"
        dep_payload = {
            "amount": 500.0,
            "gateway": "razorpay"
        }
        headers = {"Authorization": f"Bearer {token}"}
        dep_resp = await client.post(dep_url, json=dep_payload, headers=headers)
        print(f"Deposit Status: {dep_resp.status_code}")
        print(f"Deposit Response: {dep_resp.text}")

if __name__ == "__main__":
    asyncio.run(test_deposit())
