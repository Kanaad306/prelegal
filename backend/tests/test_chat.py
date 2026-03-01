import json
from unittest.mock import AsyncMock, MagicMock

import pytest
from httpx import ASGITransport, AsyncClient

from main import app
import database


@pytest.fixture
def mock_llm_response(monkeypatch):
    """Replace _call_llm with a deterministic async stub."""
    from routers import chat
    from routers.chat import NdaFieldUpdate

    async def fake_call_llm(messages):
        return NdaFieldUpdate(
            message="Got it! What is the effective date for this NDA?",
            purpose="vendor evaluation",
            party1_company="Acme Corp",
        )

    monkeypatch.setattr(chat, "_call_llm", fake_call_llm)


@pytest.mark.asyncio
async def test_chat_creates_draft_and_returns_fields(mock_llm_response):
    await database.init_db()
    payload = {
        "message": "We need an NDA for vendor evaluation. Party 1 is Acme Corp.",
        "history": [],
        "current_fields": {},
    }
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.post("/api/chat", json=payload)

    assert response.status_code == 200
    data = response.json()
    assert data["message"] == "Got it! What is the effective date for this NDA?"
    assert data["updated_fields"]["purpose"] == "vendor evaluation"
    assert data["updated_fields"]["party1Company"] == "Acme Corp"
    assert data["draft_id"] is not None


@pytest.mark.asyncio
async def test_chat_updates_existing_draft(mock_llm_response):
    """Sending draft_id causes an UPDATE rather than an INSERT."""
    # Create an initial draft row
    await database.init_db()
    async with database.get_db() as db:
        cursor = await db.execute(
            "INSERT INTO drafts (template, fields_json) VALUES (?, ?)",
            ("mutual-nda", json.dumps({"purpose": "old value"})),
        )
        existing_id = cursor.lastrowid

    payload = {
        "message": "Actually, it's for vendor evaluation.",
        "history": [{"role": "assistant", "content": "What is the purpose?"}],
        "current_fields": {"purpose": "old value"},
        "draft_id": existing_id,
    }
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.post("/api/chat", json=payload)

    assert response.status_code == 200
    data = response.json()
    assert data["draft_id"] == existing_id
    assert data["updated_fields"]["purpose"] == "vendor evaluation"

    # Verify the DB row was updated
    async with database.get_db() as db:
        cursor = await db.execute("SELECT fields_json FROM drafts WHERE id = ?", (existing_id,))
        row = await cursor.fetchone()
    assert json.loads(row["fields_json"])["purpose"] == "vendor evaluation"


@pytest.mark.asyncio
async def test_chat_preserves_existing_fields(monkeypatch):
    """Fields not returned by the LLM are kept from current_fields."""
    await database.init_db()
    from routers import chat
    from routers.chat import NdaFieldUpdate

    async def fake_call_llm(messages):
        # LLM only extracts party2 info this turn
        return NdaFieldUpdate(
            message="Great, and who is Party 2?",
            party2_company="Beta Inc",
        )

    monkeypatch.setattr(chat, "_call_llm", fake_call_llm)

    payload = {
        "message": "Party 2 is Beta Inc.",
        "history": [],
        "current_fields": {
            "purpose": "vendor evaluation",
            "party1Company": "Acme Corp",
        },
    }
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.post("/api/chat", json=payload)

    assert response.status_code == 200
    data = response.json()
    # Previously-set fields are preserved
    assert data["updated_fields"]["purpose"] == "vendor evaluation"
    assert data["updated_fields"]["party1Company"] == "Acme Corp"
    # New field was added
    assert data["updated_fields"]["party2Company"] == "Beta Inc"


@pytest.mark.asyncio
async def test_chat_missing_api_key(monkeypatch):
    monkeypatch.delenv("OPENROUTER_API_KEY", raising=False)

    payload = {
        "message": "Hello",
        "history": [],
        "current_fields": {},
    }
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.post("/api/chat", json=payload)

    assert response.status_code == 503
    assert "OPENROUTER_API_KEY" in response.json()["detail"]
