import httpx
import asyncio

async def test_register():
    url = "http://127.0.0.1:8000/api/auth/register"
    payload = {
        "full_name": "Test Official",
        "phone": "+919876543211",
        "password": "password123",
        "role": "OFFICIAL",
        "village": "Test Village",
        "district": "Test District"
    }
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(url, json=payload)
            print(f"Status: {response.status_code}")
            print(f"Body: {response.text}")
        except Exception as e:
            print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(test_register())
