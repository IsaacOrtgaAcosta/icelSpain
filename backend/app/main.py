from app.api.v1.auth import router as auth_router
from app.api.v1.projects import router as projects_router
from app.api.v1.users import router as users_router
from app.core.config import settings
from app.db.session import engine
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

app = FastAPI(
    title=settings.app_name,
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(
    auth_router,
    prefix=settings.api_v1_prefix,
)

app.include_router(
    users_router,
    prefix=settings.api_v1_prefix,
)

app.include_router(
    projects_router,
    prefix=settings.api_v1_prefix,
)


@app.get("/health")
def health_check() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/health/database")
def database_health_check() -> dict[str, str]:
    with engine.connect() as connection:
        connection.execute(text("SELECT 1"))

    return {
        "status": "ok",
        "database": "connected",
    }
