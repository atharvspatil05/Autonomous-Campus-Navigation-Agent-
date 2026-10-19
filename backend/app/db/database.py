"""Database engine setup and session management."""
from __future__ import annotations

from sqlmodel import Session, SQLModel, create_engine

from app.config import settings

engine = create_engine(
    settings.database_url,
    echo=settings.debug,
    connect_args={"check_same_thread": False},  # Required for SQLite
)


def create_db_and_tables() -> None:
    """Create all tables if they don't exist."""
    SQLModel.metadata.create_all(engine)


def get_session():
    """FastAPI dependency: yields a database session."""
    with Session(engine) as session:
        yield session
