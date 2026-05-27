import asyncio
import httpx

async def test_register():
    url = "http://127.0.0.1:8000/api/v1/auth/register"
    payload = {
        "username": "rohit123",
        "email": "rohit@test.com",
        "mobile": "9988776655",
        "full_name": "Rohit Kumar",
        "password": "temp_pass_will_set_later"
    }
    
    async with httpx.AsyncClient() as client:
        response = await client.post(url, json=payload)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")

if __name__ == "__main__":
    asyncio.run(test_register())
