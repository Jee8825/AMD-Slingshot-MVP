"""
Quick integration test for auth endpoints using TestClient.
Run: DATABASE_URL=sqlite+aiosqlite:///./test_auth.db python test_auth_quick.py
"""
import os
os.environ["DATABASE_URL"] = "sqlite+aiosqlite:///./test_auth_verified.db"

import asyncio
from app.database import engine, Base
from app.models.user import User

# Create tables first
async def setup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all, tables=[User.__table__])
        await conn.run_sync(Base.metadata.create_all, tables=[User.__table__])

asyncio.run(setup())

from httpx import AsyncClient, ASGITransport
from app.main import app

async def run_tests():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        print("=" * 60)
        print("🧪 DigiGram Pro — Auth Endpoint Tests")
        print("=" * 60)

        # ── Test 1: Register ─────────────────────────────
        print("\n1️⃣  POST /api/auth/register")
        r = await client.post("/api/auth/register", json={
            "full_name": "Raju Kumar",
            "phone": "+919876543210",
            "email": "raju@example.com",
            "password": "strong_pass123",
            "role": "CITIZEN",
            "village": "Koraput",
            "district": "Koraput",
        })
        assert r.status_code == 201, f"Expected 201, got {r.status_code}: {r.text}"
        data = r.json()
        assert "access_token" in data
        assert data["user"]["full_name"] == "Raju Kumar"
        assert data["user"]["role"] == "CITIZEN"
        print(f"   ✅ 201 Created — user_id={data['user']['id'][:8]}…")

        # ── Test 2: Duplicate phone ──────────────────────
        print("\n2️⃣  POST /api/auth/register (duplicate phone)")
        r2 = await client.post("/api/auth/register", json={
            "full_name": "Duplicate",
            "phone": "+919876543210",
            "password": "test123456",
        })
        assert r2.status_code == 409, f"Expected 409, got {r2.status_code}"
        print(f"   ✅ 409 Conflict — {r2.json()['detail']}")

        # ── Test 3: Login ────────────────────────────────
        print("\n3️⃣  POST /api/auth/login")
        r3 = await client.post("/api/auth/login", json={
            "phone": "+919876543210",
            "password": "strong_pass123",
        })
        assert r3.status_code == 200, f"Expected 200, got {r3.status_code}: {r3.text}"
        token = r3.json()["access_token"]
        print(f"   ✅ 200 OK — token={token[:30]}…")

        # ── Test 4: Login wrong password ─────────────────
        print("\n4️⃣  POST /api/auth/login (wrong password)")
        r4 = await client.post("/api/auth/login", json={
            "phone": "+919876543210",
            "password": "wrong_pass",
        })
        assert r4.status_code == 401, f"Expected 401, got {r4.status_code}"
        print(f"   ✅ 401 Unauthorized — {r4.json()['detail']}")

        # ── Test 5: /me with valid token ─────────────────
        print("\n5️⃣  GET /api/auth/me (valid token)")
        r5 = await client.get("/api/auth/me", headers={
            "Authorization": f"Bearer {token}"
        })
        assert r5.status_code == 200, f"Expected 200, got {r5.status_code}: {r5.text}"
        me_data = r5.json()
        assert me_data["phone"] == "+919876543210"
        assert me_data["role"] == "CITIZEN"
        print(f"   ✅ 200 OK — {me_data['full_name']} ({me_data['role']})")

        # ── Test 6: /me without token ────────────────────
        print("\n6️⃣  GET /api/auth/me (no token)")
        r6 = await client.get("/api/auth/me")
        assert r6.status_code == 401, f"Expected 401, got {r6.status_code}"
        print(f"   ✅ 401 Unauthorized — Not authenticated")

        # ── Test 7: Register OFFICIAL ────────────────────
        print("\n7️⃣  POST /api/auth/register (OFFICIAL role)")
        r7 = await client.post("/api/auth/register", json={
            "full_name": "Officer Singh",
            "phone": "+919999888877",
            "password": "officer_pass",
            "role": "OFFICIAL",
        })
        assert r7.status_code == 201
        assert r7.json()["user"]["role"] == "OFFICIAL"
        print(f"   ✅ 201 Created — role=OFFICIAL")

        print("\n" + "=" * 60)
        print("🎉  All 7 tests PASSED!")
        print("=" * 60)

asyncio.run(run_tests())

# Cleanup
os.remove("./test_auth_verified.db") if os.path.exists("./test_auth_verified.db") else None
