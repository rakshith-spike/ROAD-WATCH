# RoadWatch 2.0 - AI Road Intelligence & Public Safety Platform

RoadWatch 2.0 is a production-structured smart-city platform for road condition intelligence, citizen reporting, contractor accountability, and governance analytics.

It is designed to impress:
- Hackathon judges
- Recruiters and startups
- Municipal/government evaluators (BBMP/NHAI style workflows)

## What Was Upgraded

- Refactored from MVP to modular enterprise architecture
- Added API versioning (`/api/v1`), service/repository pattern, middleware, and centralized config
- Replaced static runtime data flow with MongoDB-first storage and seed pipelines
- Added JWT auth with RBAC (`citizen`, `contractor`, `government_admin`, `super_admin`)
- Introduced scalable React Router architecture with premium responsive UI
- Added Tailwind + Framer Motion + Recharts + toast notifications + dark/light mode
- Upgraded map to smart GIS dashboard with severity overlays, dynamic markers, clustering concept, and nearby issue detection
- Added AI readiness for risk scoring, multilingual responses, analytics summaries, and CV placeholders
- Added Docker and docker-compose deployment support

## Architecture

## Monorepo Structure

```text
ROADWATCH2/
├── backend/
│   ├── app/
│   │   ├── routers/v1/        # Versioned APIs
│   │   ├── services/          # Business logic
│   │   ├── repositories/      # DB access layer
│   │   ├── database/          # Mongo manager, indexes, seed
│   │   ├── schemas/           # Request/response contracts
│   │   ├── middleware/        # Rate limit, request context
│   │   ├── auth/              # JWT, RBAC, password hashing
│   │   ├── ai/                # Prompting + memory scaffolds
│   │   ├── analytics/         # Risk scoring engine
│   │   ├── geospatial/        # Nearby issue helpers
│   │   ├── alerts/            # Governance recommendations
│   │   ├── cv/                # YOLO/OpenCV-ready placeholders
│   │   └── main.py            # App bootstrap
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── app/               # Router + app shell
│   │   ├── components/        # Reusable UI building blocks
│   │   ├── pages/             # Route pages
│   │   ├── providers/         # Theme/Auth/Data providers
│   │   ├── services/          # API client layer
│   │   └── styles/            # Tailwind + global theme styles
│   ├── tailwind.config.js
│   ├── package.json
│   └── Dockerfile
└── docker-compose.yml
```

## Scalability Design

- Layered backend (`router -> service -> repository -> database`)
- Async FastAPI + async MongoDB (Motor)
- Indexing for high-read collections (`roads`, `complaints`, `alerts`, `users`)
- API versioning for backward compatibility and safe evolution
- Frontend route-level lazy loading and code splitting
- Reusable component architecture and provider-based state access
- CV and RAG-ready extension points without breaking current APIs

## Feature Set

- Smart road map with severity overlays and issue clusters
- Citizen complaint desk with optional voice note capture
- AI civic assistant (Gemini + fallback engine)
- Road risk scoring and predictive trend cards
- Contractor accountability dashboard
- Public transparency/admin governance dashboards
- Budget anomaly intelligence
- Emergency SOS endpoint
- Dark/light premium UI + responsive layout

## API Highlights

Base URL (legacy compatibility):
- `http://localhost:8000`

Versioned base URL:
- `http://localhost:8000/api/v1`

### Health
- `GET /health`
- `GET /api/v1/health`

### Auth
- `POST /api/v1/auth/signup`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/refresh`

### Roads
- `GET /roads` (legacy)
- `GET /api/v1/roads`
- `GET /api/v1/roads/paged`
- `GET /api/v1/roads/{road_id}`
- `POST /api/v1/roads` (RBAC)
- `PATCH /api/v1/roads/{road_id}` (RBAC)

### Complaints
- `GET /complaints` (legacy)
- `POST /complaints` (legacy)
- `GET /api/v1/complaints`
- `GET /api/v1/complaints/paged`
- `POST /api/v1/complaints`
- `GET /api/v1/complaints/sos/emergency`

### Analytics
- `GET /analytics/summary` (legacy)
- `GET /analytics/contractors` (legacy)
- `GET /api/v1/analytics/summary`
- `GET /api/v1/analytics/contractors`
- `GET /api/v1/analytics/monthly-trends`
- `GET /api/v1/analytics/risk-cards`

### AI
- `POST /ai/chat` (legacy)
- `POST /ai/analyze-image` (legacy)
- `POST /api/v1/ai/chat`
- `POST /api/v1/ai/analyze-image`
- `GET /api/v1/ai/road-risk/{road_id}`

### Alerts/Admin/Contractors/Geo/CV
- `GET /api/v1/alerts`
- `POST /api/v1/alerts` (RBAC)
- `GET /api/v1/admin/transparency`
- `GET /api/v1/admin/budget-anomalies` (RBAC)
- `GET /api/v1/contractors`
- `GET /api/v1/geospatial/nearby-issues`
- `POST /api/v1/cv/detect-damage`

## Local Setup

## 1) Backend

```bash
cd backend
cp .env.example .env
# add GEMINI_API_KEY if available
pip install -r requirements.txt
uvicorn app.main:app --reload
```

## 2) Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`, backend at `http://localhost:8000`.

## Docker Setup

```bash
docker-compose up --build
```

Services:
- MongoDB: `localhost:27017`
- Backend: `localhost:8000`
- Frontend (nginx): `localhost:5173`

## Deployment Guide

### Frontend -> Vercel
- Set `VITE_API_BASE_URL` to deployed backend URL
- Build command: `npm run build`
- Output directory: `dist`

### Backend -> Render / Railway
- Runtime: Python 3.11+
- Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- Env vars: use `backend/.env.example` template

### Database -> MongoDB Atlas
- Create Atlas cluster
- Set `MONGO_URI` and `MONGO_DB_NAME`
- Keep indexes enabled via startup bootstrap

## Security & Governance

- JWT access/refresh tokens
- Role-based access control
- Password hashing (bcrypt via passlib)
- CORS controls via config
- Input sanitization utility for complaint text
- Rate limiting middleware for abuse control

## AI Workflow

- Gemini-driven contextual prompt engine
- Road context grounding from MongoDB
- Conversational memory scaffold for continuity
- Fallback deterministic reasoning when Gemini is unavailable
- AI history persistence for auditability

## Hackathon Differentiators

- Government + citizen + contractor multi-stakeholder UX in one product
- Smart map intelligence beyond static markers
- AI-generated prioritization, summaries, and alert-ready narratives
- Budget anomaly signals for governance impact
- SOS + transparency dashboard for high demo value
- CV-ready architecture for future pothole detection

## Future Scope

- Live IoT + CCTV ingestion
- YOLOv8/OpenCV production inference service
- Vector DB + RAG for policy docs and contractor contracts
- WebSocket event streams for real-time map updates
- Ward-level predictive maintenance scheduling engine

## Screenshot Placeholders

Add screenshots here before final submission:
- `/screenshots/dashboard.png`
- `/screenshots/map.png`
- `/screenshots/analytics.png`
- `/screenshots/assistant.png`
- `/screenshots/admin.png`

---

RoadWatch 2.0 is now structured for demo impact today and production growth tomorrow.
