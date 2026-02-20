# DigiGram Pro 🏛️

> Rural e-governance platform — grievance tracking, financial transparency, and AI-verified task completion.

## Stack

| Layer | Tech |
|-------|------|
| Frontend | Next.js 14 (App Router, TypeScript, Tailwind CSS) |
| Backend | FastAPI (Python 3.12, async SQLAlchemy) |
| Database | PostgreSQL 16 |
| AI | Google Gemini Vision API |

## Quick Start

```bash
# 1. Copy environment file
cp .env.example .env

# 2. Start everything with Docker
docker compose up -d

# 3. Run database migrations
docker compose exec backend alembic upgrade head

# 4. Open the app
#    Frontend → http://localhost:3000
#    API docs → http://localhost:8000/docs
```

## Development (without Docker)

### Backend
```bash
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Database
```bash
# Start Postgres only
docker compose up db -d

# Run migrations
cd backend && alembic upgrade head
```

## Project Structure

```
AMD_MVP/
├── frontend/          # Next.js 14
├── backend/           # FastAPI
│   ├── app/
│   │   ├── models/    # SQLAlchemy ORM
│   │   ├── schemas/   # Pydantic I/O
│   │   ├── routers/   # API routes
│   │   ├── services/  # Business logic
│   │   ├── middleware/ # Auth guards
│   │   └── utils/     # Helpers
│   └── alembic/       # DB migrations
├── docker-compose.yml
└── .env.example
```

## Core Features

1. **Secure Auth** — JWT-based, role-gated (Citizen / Official / Admin)
2. **Grievance Reporting** — Geo-tagged complaints with status tracking
3. **Audit Ledger** — Immutable SHA-256 chained financial records
4. **AI Verification** — Gemini Vision powered task-completion checks
