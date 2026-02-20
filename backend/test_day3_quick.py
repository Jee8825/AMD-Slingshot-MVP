import asyncio
import httpx
from random import randint
from app.main import app

async def test_endpoints():
    print("\n--- Starting Quick Async Test without Server ---")
    transport = httpx.ASGITransport(app=app)
    
    # We must use AsyncClient with the ASGI app
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        # 1. Register a Citizen
        citizen_phone = f"99999{randint(10000, 99999)}"
        print(f"[*] Registering Citizen: {citizen_phone}")
        resp = await client.post("/api/auth/register", json={
            "full_name": "Test Citizen",
            "phone": citizen_phone,
            "password": "password123",
            "role": "CITIZEN",
            "village": "Test Village",
            "district": "Test District"
        })
        assert resp.status_code == 201, f"Failed to register citizen: {resp.text}"
        citizen_token = resp.json()["access_token"]

        # 2. Register an Official
        official_phone = f"88888{randint(10000, 99999)}"
        print(f"[*] Registering Official: {official_phone}")
        resp = await client.post("/api/auth/register", json={
            "full_name": "Test Official",
            "phone": official_phone,
            "password": "password123",
            "role": "OFFICIAL",
            "village": "Test Village",
            "district": "Test District"
        })
        assert resp.status_code == 201, f"Failed to register official: {resp.text}"
        official_token = resp.json()["access_token"]

        # 3. Citizen Creates Grievance
        print("[*] Testing Citizen Create Grievance")
        headers = {"Authorization": f"Bearer {citizen_token}"}
        resp = await client.post("/api/v1/grievances/", json={
            "title": "Water Leakage",
            "description": "Pipe broken near the main road",
            "category": "Water",
            "latitude": 12.9716,
            "longitude": 77.5946,
            "address": "Main Road, Test Village"
        }, headers=headers)
        assert resp.status_code == 201, f"Failed to create grievance: {resp.text}"
        grievance_id = resp.json()["id"]

        # 4. Official Creates Project
        print("[*] Testing Official Create Project")
        headers = {"Authorization": f"Bearer {official_token}"}
        resp = await client.post("/api/v1/projects/", json={
            "name": "Road Repair Scheme 2026",
            "description": "Repairing all main roads",
            "allocated_budget": 50000.0,
            "disbursed_amount": 0.0
        }, headers=headers)
        assert resp.status_code == 201, f"Failed to create project: {resp.text}"
        project_id = resp.json()["id"]

        # 5. Citizen Attempts to Create Project (Should Fail)
        print("[*] Testing Citizen Create Project (Should Fail)")
        headers = {"Authorization": f"Bearer {citizen_token}"}
        resp = await client.post("/api/v1/projects/", json={
            "name": "Unauthorized Scheme",
            "allocated_budget": 1000.0,
            "disbursed_amount": 0.0
        }, headers=headers)
        assert resp.status_code == 403, f"Citizen was able to create a project!: {resp.text}"
        
        # 6. Official Updates Project Disbursed Amount
        print("[*] Testing Official Update Project")
        headers = {"Authorization": f"Bearer {official_token}"}
        resp = await client.put(f"/api/v1/projects/{project_id}", json={
            "disbursed_amount": 25000.0
        }, headers=headers)
        assert resp.status_code == 200, f"Failed to update project: {resp.text}"
        
        # 7. Official Updates Project with Invalid Disbursed Amount (Should Fail)
        print("[*] Testing Official Invalid Update Project (Should Fail)")
        headers = {"Authorization": f"Bearer {official_token}"}
        resp = await client.put(f"/api/v1/projects/{project_id}", json={
            "disbursed_amount": 60000.0
        }, headers=headers)
        assert resp.status_code == 400, f"Official bypassed budget validation!: {resp.text}"
        
        print("\n✅ All Endpoints Verified Successfully!")

if __name__ == "__main__":
    asyncio.run(test_endpoints())
