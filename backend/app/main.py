from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import get_settings
from app.core.exceptions import register_exception_handlers
from app.core.logging import configure_logging
from app.database.indexes import create_indexes
from app.database.mongodb import mongo_manager
from app.database.seed import seed_database_if_empty
from app.middleware.rate_limit import RateLimitMiddleware
from app.middleware.request_context import RequestContextMiddleware
from app.routers import legacy
from app.routers.v1 import admin, ai, alerts, analytics, auth, complaints, contractors, cv, geospatial, health, roads

settings = get_settings()


@asynccontextmanager
async def lifespan(_: FastAPI):
    configure_logging()
    await mongo_manager.connect()
    db = mongo_manager.get_db()
    await create_indexes(db)
    await seed_database_if_empty(db)
    yield
    await mongo_manager.disconnect()


app = FastAPI(
    title=settings.app_name,
    description="AI-powered road intelligence, geospatial monitoring, and civic accountability platform.",
    version="2.0.0",
    lifespan=lifespan,
)
register_exception_handlers(app)

# FIX: CORS added LAST = runs FIRST (Starlette reverses middleware order).
# This ensures CORS headers appear on every response — including errors and 404s.
app.add_middleware(RequestContextMiddleware)
app.add_middleware(RateLimitMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

v1_prefix = settings.api_v1_prefix
app.include_router(health.router, prefix=v1_prefix)
app.include_router(auth.router, prefix=v1_prefix)
app.include_router(roads.router, prefix=v1_prefix)
app.include_router(complaints.router, prefix=v1_prefix)
app.include_router(analytics.router, prefix=v1_prefix)
app.include_router(ai.router, prefix=v1_prefix)
app.include_router(alerts.router, prefix=v1_prefix)
app.include_router(contractors.router, prefix=v1_prefix)
app.include_router(admin.router, prefix=v1_prefix)
app.include_router(geospatial.router, prefix=v1_prefix)
app.include_router(cv.router, prefix=v1_prefix)

app.include_router(legacy.router)


@app.get("/health")
async def root_health() -> dict[str, str]:
    return {"status": "ok", "service": settings.app_name}
