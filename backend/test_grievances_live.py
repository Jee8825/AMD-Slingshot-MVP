import asyncio
import httpx

async def run_tests():
    async with httpx.AsyncClient(base_url="http://127.0.0.1:8000") as client:
        print("Registering user...")
        r = await client.post("/api/auth/register", json={
            "full_name": "Test Citizen Live",
            "phone": "+918888888889", # different phone to avoid conflict
            "password": "password123",
            "role": "CITIZEN",
        })
        if r.status_code == 409:
            # Login instead
            r = await client.post("/api/auth/login", json={
                "phone": "+918888888889",
                "password": "password123",
            })
            token = r.json()["access_token"]
        elif r.status_code == 201:
            token = r.json()["access_token"]
        else:
            print("Failed to register/login:", r.text)
            return

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
        
        g = data[-1] # latest grievance
        print(f"Grievance coordinates: ({g.get('latitude')}, {g.get('longitude')})")
        assert g.get("latitude") == 12.345678
        assert g.get("longitude") == 98.765432
        
        status = g.get('status')
        print(f"Status of grievance: {status}")
        
        print("Fetching specific status...")
        r4 = await client.get(f"/api/v1/grievances/?status={status}", headers=headers)
        assert r4.status_code == 200
        print(f"Got {len(r4.json())} match(es) for correct status")
        assert all(item['status'] == status for item in r4.json())
        
        r5 = await client.get("/api/v1/grievances/?status=NonExistentStatus", headers=headers)
        assert r5.status_code == 200
        assert len(r5.json()) == 0
        print("Got 0 matches for incorrect status")
        
        print("ALL TESTS PASSED")

if __name__ == "__main__":
    asyncio.run(run_tests())
