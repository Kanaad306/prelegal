# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Prelegal is a SaaS product that allows users to draft legal agreements based on templates in the `templates/` directory. Users interact with an AI chat to determine which document they need and how to fill in the required fields. Available documents are listed in `catalog.json`.

The **current implementation** (V1 foundation) includes a working FastAPI backend, async SQLite database, Docker packaging, and cross-platform start/stop scripts. The frontend is a static Next.js export served by the backend. AI chat is not yet implemented.

## Development Process

When instructed to build a feature:

1. Use Atlassian tools to read the feature instructions from Jira.
2. Develop the feature without skipping any step from the feature-dev 7-step process.
3. Thoroughly test the feature with unit and integration tests, and fix any issues.
4. Submit a PR using GitHub tools.

## AI Design

When writing code that calls LLMs, use the Cerebras skill with LiteLLM via OpenRouter and the `gpt-oss-120b` model, with Cerebras as the inference provider. Use Structured Outputs so results can be interpreted and mapped into fields in the legal document.

## Technical Design

The entire project is packaged into a Docker container.

- **Backend**: `backend/` — `uv` project using FastAPI. Available at `http://localhost:8000`.
- **Frontend**: `frontend/` — Next.js 15 app. Statically built and served via FastAPI where feasible.
- **Scripts**: `scripts/` contains start/stop scripts for each platform:

```
scripts/start-mac.sh        scripts/stop-mac.sh
scripts/start-linux.sh      scripts/stop-linux.sh
scripts/start-windows.ps1   scripts/stop-windows.ps1
```

## Project Structure

### Legal template dataset (`templates/` + `catalog.json`)
12 Markdown legal agreement templates sourced from [Common Paper](https://github.com/CommonPaper) under **CC BY 4.0**. `catalog.json` is the canonical index with `name`, `description`, and `filename` for each template. Adding a template means adding the `.md` file to `templates/` and a corresponding entry in `catalog.json`.

Template files use `<span class="coverpage_link">FieldName</span>` to mark form-fillable variables (e.g. `Purpose`, `Governing Law`).

### Frontend (`frontend/`)
Next.js 15 (App Router), TypeScript, Tailwind CSS 3. Currently a single client-side page (`"use client"`) with:
- **Left panel** — form collecting NDA cover-page fields (`NdaValues` interface in `page.tsx`)
- **Right panel** — live `NdaPreview` component interpolating values into the full 11-clause NDA

The `F` component renders a filled value or a grey italic placeholder. PDF export uses `window.print()`; the `.no-print` CSS class hides UI chrome during printing.

### Backend (`backend/`)
FastAPI + `uv`. Key files:
- `main.py` — app entry point; mounts `GET /api/health`, runs `database.init_db()` on startup, and serves the Next.js static export from `frontend/out/` at `/`
- `database.py` — async SQLite via `aiosqlite`; `init_db()` creates the `drafts` table; `get_db()` is an async context manager with commit/rollback; DB path defaults to `/data/prelegal.db` (overridable via `PRELEGAL_DB_PATH` env var)
- `routers/health.py` — `GET /api/health` → `{ status: "ok", version: "<pkg-version>" }`
- `pyproject.toml` — deps: `fastapi`, `uvicorn[standard]`, `aiosqlite`; dev deps: `pytest`, `pytest-asyncio`, `httpx`
- `tests/` — `conftest.py` sets up an isolated in-memory DB per test via `monkeypatch` + `importlib.reload`

### Static marketing site (root)
`index.html` + `styles.css` — single-page company website, no build step.

## Environment & Commands

### Frontend
```bash
cd frontend
npm install
npm run dev        # → http://localhost:3000
npm run build      # production build + type-check
npm start
```

### Backend
```bash
cd backend
uv pip install -e ".[dev]"
uv run uvicorn main:app --reload   # → http://localhost:8000
```

### Backend tests
```bash
cd backend
uv run pytest -v
```

### Full stack (Docker)
```bash
# Mac
./scripts/start-mac.sh
./scripts/stop-mac.sh
```

## Design System

All new UI must use the following colour tokens:

| Token | Hex | Usage |
|---|---|---|
| Blue Primary | `#209dd7` | Primary buttons, links |
| Accent Yellow | `#ecad0a` | Highlights, accents |
| Purple Secondary | `#753991` | Submit buttons |
| Dark Navy | `#032147` | Headings |
| Gray Text | `#888888` | Body / secondary text |

Tailwind custom colours are declared in `frontend/tailwind.config.ts`. These tokens are already configured — use them directly (e.g. `bg-primary`, `text-dark-navy`, `bg-accent`). The old `#2d5be3` / `#1a1a2e` prototype palette has been replaced.

## Key Conventions

- **Template variables**: `<span class="coverpage_link">FieldName</span>` for fillable fields in Markdown templates.
- **Print/PDF**: `className="no-print"` on any UI chrome to hide during printing; `@media print` styles live in `globals.css`.
- **Commit style**: conventional commits (`feat(scope):`, `fix(scope):`, etc.) where scope matches the Jira ticket (e.g. `PL-3`).
- **LLM calls**: always use Structured Outputs; never parse free-form LLM text to fill document fields.

## Implementation Status

| Ticket | Feature | Status |
|--------|---------|--------|
| PL-1 | Static marketing site (`index.html`) | Done |
| PL-2 | Legal template dataset (`templates/` + `catalog.json`) | Done |
| PL-3 | Mutual NDA creator (frontend form + live preview + PDF export) | Done |
| PL-4 | V1 foundation: FastAPI backend, SQLite DB, Docker, start/stop scripts, Tailwind color tokens | Done |

**Docker internals**: multi-stage build (Node 22 Alpine → Python 3.12 slim); named volume `prelegal-data` persists SQLite; `HEALTHCHECK` polls `GET /api/health`; `PRELEGAL_DB_PATH` env var controls DB location (default `/data/prelegal.db`).
