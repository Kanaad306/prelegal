import json
import os
import re
from typing import Literal, Optional

import litellm
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

import database

router = APIRouter(tags=["chat"])

SYSTEM_PROMPT = """You are a friendly legal assistant helping users fill out a Mutual Non-Disclosure Agreement (MNDA).

Your job is to have a natural conversation to gather information for the NDA, then populate the document fields.

The NDA has these fields (use exact key names in your JSON output):
- purpose: What the NDA is for (e.g. "evaluating a potential business partnership")
- effective_date: Start date in YYYY-MM-DD format
- mnda_term_type: "expires" (fixed term) or "continues" (until terminated by either party)
- mnda_term_years: Number of years as a string (only if mnda_term_type is "expires")
- confidentiality_type: "years" (fixed duration) or "perpetuity" (lasts forever)
- confidentiality_years: Number of years as a string (only if confidentiality_type is "years")
- governing_law: Which state's laws govern (e.g. "Delaware")
- jurisdiction: Where disputes are resolved (e.g. "courts located in New Castle, DE")
- party1_company, party1_name, party1_title, party1_address: First party details
- party2_company, party2_name, party2_title, party2_address: Second party details

Guidelines:
- Be warm, concise, and ask 1-2 questions at a time.
- Only set a field when you are confident of its value.
- For effective_date, if the user says "today" use today's date.
- For term/confidentiality questions, briefly explain the options if the user seems unsure.
- When all fields are filled, congratulate the user and suggest they download the PDF.

You MUST respond with a JSON object in exactly this format (no extra keys, no markdown):
{
  "message": "<your conversational reply>",
  "purpose": "<value or null>",
  "effective_date": "<YYYY-MM-DD or null>",
  "mnda_term_type": "<'expires' or 'continues' or null>",
  "mnda_term_years": "<string or null>",
  "confidentiality_type": "<'years' or 'perpetuity' or null>",
  "confidentiality_years": "<string or null>",
  "governing_law": "<value or null>",
  "jurisdiction": "<value or null>",
  "party1_company": "<value or null>",
  "party1_name": "<value or null>",
  "party1_title": "<value or null>",
  "party1_address": "<value or null>",
  "party2_company": "<value or null>",
  "party2_name": "<value or null>",
  "party2_title": "<value or null>",
  "party2_address": "<value or null>"
}"""


def _to_camel(snake: str) -> str:
    """Convert snake_case to camelCase (e.g. effective_date → effectiveDate)."""
    return re.sub(r"_([a-z])", lambda m: m.group(1).upper(), snake)


class ChatMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str


class ChatRequest(BaseModel):
    message: str
    history: list[ChatMessage]
    current_fields: dict
    draft_id: Optional[int] = None


class NdaFieldUpdate(BaseModel):
    """Structured output returned by the LLM."""
    message: str
    purpose: Optional[str] = None
    effective_date: Optional[str] = None
    mnda_term_type: Optional[Literal["expires", "continues"]] = None
    mnda_term_years: Optional[str] = None
    confidentiality_type: Optional[Literal["years", "perpetuity"]] = None
    confidentiality_years: Optional[str] = None
    governing_law: Optional[str] = None
    jurisdiction: Optional[str] = None
    party1_company: Optional[str] = None
    party1_name: Optional[str] = None
    party1_title: Optional[str] = None
    party1_address: Optional[str] = None
    party2_company: Optional[str] = None
    party2_name: Optional[str] = None
    party2_title: Optional[str] = None
    party2_address: Optional[str] = None


# camelCase frontend keys derived from NdaFieldUpdate (excluding the message field).
_ALLOWED_FRONTEND_KEYS = {
    _to_camel(f) for f in NdaFieldUpdate.model_fields if f != "message"
}


class ChatResponse(BaseModel):
    message: str
    updated_fields: dict
    draft_id: Optional[int]


async def _call_llm(messages: list[dict]) -> NdaFieldUpdate:
    """Call the LLM and parse the structured JSON response."""
    api_key = os.environ.get("OPENROUTER_API_KEY")
    if not api_key:
        raise HTTPException(status_code=503, detail="OPENROUTER_API_KEY not configured")

    response = await litellm.acompletion(
        model="openrouter/cerebras/gpt-oss-120b",
        messages=messages,
        response_format={"type": "json_object"},
        api_key=api_key,
    )
    content = response.choices[0].message.content
    try:
        return NdaFieldUpdate.model_validate_json(content)
    except Exception:
        raise HTTPException(status_code=502, detail="LLM returned an unparseable response")


@router.post("/chat", response_model=ChatResponse)
async def chat(body: ChatRequest) -> ChatResponse:
    messages = [{"role": "system", "content": SYSTEM_PROMPT}]
    for msg in body.history:
        messages.append({"role": msg.role, "content": msg.content})
    messages.append({"role": "user", "content": body.message})

    update = await _call_llm(messages)

    # Start from a sanitised copy of current_fields (only known NDA keys allowed).
    updated = {k: v for k, v in body.current_fields.items() if k in _ALLOWED_FRONTEND_KEYS}

    # Merge non-null LLM fields, converting snake_case → camelCase.
    for llm_field in NdaFieldUpdate.model_fields:
        if llm_field == "message":
            continue
        value = getattr(update, llm_field, None)
        if value is not None:
            updated[_to_camel(llm_field)] = value

    # Persist draft to SQLite.
    draft_id = body.draft_id
    async with database.get_db() as db:
        if draft_id is not None:
            cursor = await db.execute(
                "UPDATE drafts SET fields_json = ?, updated_at = datetime('now') WHERE id = ?",
                (json.dumps(updated), draft_id),
            )
            if cursor.rowcount == 0:
                raise HTTPException(status_code=404, detail=f"Draft {draft_id} not found")
        else:
            cursor = await db.execute(
                "INSERT INTO drafts (template, fields_json) VALUES (?, ?)",
                ("mutual-nda", json.dumps(updated)),
            )
            draft_id = cursor.lastrowid

    return ChatResponse(message=update.message, updated_fields=updated, draft_id=draft_id)
