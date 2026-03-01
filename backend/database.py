import os
from contextlib import asynccontextmanager
from pathlib import Path
from typing import AsyncIterator

import aiosqlite

# DB path is configurable via environment variable for Docker volume mounting.
# Default is /data/prelegal.db (the Docker volume mount point).
DB_PATH: str = os.environ.get("PRELEGAL_DB_PATH", "/data/prelegal.db")

_CREATE_DRAFTS_TABLE = """
CREATE TABLE IF NOT EXISTS drafts (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    template    TEXT    NOT NULL,
    fields_json TEXT    NOT NULL DEFAULT '{}',
    created_at  TEXT    NOT NULL DEFAULT (datetime('now')),
    updated_at  TEXT    NOT NULL DEFAULT (datetime('now'))
);
"""


async def init_db() -> None:
    """Create the database file and schema if they do not exist."""
    db_path = Path(DB_PATH)
    db_path.parent.mkdir(parents=True, exist_ok=True)
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute(_CREATE_DRAFTS_TABLE)
        await db.commit()


@asynccontextmanager
async def get_db() -> AsyncIterator[aiosqlite.Connection]:
    """Async context manager yielding a live database connection."""
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        try:
            yield db
            await db.commit()
        except Exception:
            await db.rollback()
            raise
