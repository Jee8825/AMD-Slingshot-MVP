import os
os.environ["DATABASE_URL"] = "sqlite+aiosqlite:///./test_grievance_fast.db"

import asyncio
from app.database import engine, Base
from app.models.user import User
from app.models.grievance import Grievance
from httpx import AsyncClient, ASGITransport
from app.main import app

async def setup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)

async def run_tests():
    await setup()
    
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        print("Registering user...")
        r = await client.post("/api/auth/register", json={
            "full_name": "Test Citizen",
            "phone": "+918888888888",
            "password": "password123",
            "role": "CITIZEN",
        })
        token = r.json()["access_token"]
        
        headers = {"Authorization": f"Bearer {token}"}
        
        print("Creating grievance...")
        r2 = await client.post("/api/v1/grievances/", json={
            "title": "Pothole in road",
            "description": "Big pothole",
            "category": "Infrastructure",
            "latitude": 12.345678,
            "longitude": 98.765432,
            "address": "Main Street"
        }, headers=headers)
        
        assert r2.status_code == 201, f"Failed to create grievance: {r2.text}"
        print("Created successfully!")
        
        print("Fetching all grievances...")
        r3 = await client.get("/api/v1/grievances/", headers=headers)
        assert r3.status_code == 200
        data = r3.json()
        assert len(data) == 1
        
        g = data[0]
        print(f"Grievance coordinates: ({g.get('latitude')}, {g.get('longitude')})")
        assert g.get("latitude") == 12.345678
        assert g.get("longitude") == 98.765432
        
        print(f"Status of grievance: {g.get('status')}")
        
        print("Fetching specific status...")
        r4 = await client.get(f"/api/v1/grievances/?status={g.get('status')}", headers=headers)
        assert r4.status_code == 200
        assert len(r4.json()) == 1
        print("Got 1 match for correct status")
        
        r5 = await client.get("/api/v1/grievances/?status=NonExistentStatus", headers=headers)
        assert r5.status_code == 200
        assert len(r5.json()) == 0
        print("Got 0 matches for incorrect status")
        
        print("ALL TESTS PASSED")

if __name__ == "__main__":
    asyncio.run(run_tests())
    if os.path.exists("./test_grievance_fast.db"):
        os.remove("./test_grievance_fast.db")
