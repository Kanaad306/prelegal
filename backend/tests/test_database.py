import pytest
import aiosqlite

import database


@pytest.mark.asyncio
async def test_init_db_creates_drafts_table():
    await database.init_db()
    async with aiosqlite.connect(database.DB_PATH) as db:
        cursor = await db.execute(
            "SELECT name FROM sqlite_master WHERE type='table' AND name='drafts';"
        )
        row = await cursor.fetchone()
    assert row is not None, "drafts table was not created"


@pytest.mark.asyncio
async def test_drafts_table_has_expected_columns():
    await database.init_db()
    async with aiosqlite.connect(database.DB_PATH) as db:
        cursor = await db.execute("PRAGMA table_info(drafts);")
        rows = await cursor.fetchall()
    column_names = [row[1] for row in rows]
    assert "id" in column_names
    assert "template" in column_names
    assert "fields_json" in column_names
    assert "created_at" in column_names
    assert "updated_at" in column_names


@pytest.mark.asyncio
async def test_init_db_is_idempotent():
    await database.init_db()
    await database.init_db()
    async with aiosqlite.connect(database.DB_PATH) as db:
        cursor = await db.execute("SELECT COUNT(*) FROM drafts;")
        row = await cursor.fetchone()
    assert row[0] == 0
