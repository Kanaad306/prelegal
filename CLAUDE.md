# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Prelegal is a SaaS product that allows users to draft legal agreements based on templates in the `templates/` directory. Users interact with an AI chat to determine which document they need and how to fill in the required fields. Available documents are listed in `catalog.json`.

The **current implementation** is a frontend-only prototype supporting only the Mutual NDA document, with no AI chat yet.

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
FastAPI + `uv`. Serves the statically built frontend and will expose API routes for AI-assisted document drafting.

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

Tailwind custom colours are declared in `frontend/tailwind.config.ts`. Update these tokens there when building new UI; the old `#2d5be3` / `#1a1a2e` palette from the prototype should be migrated to the above.

## Key Conventions

- **Template variables**: `<span class="coverpage_link">FieldName</span>` for fillable fields in Markdown templates.
- **Print/PDF**: `className="no-print"` on any UI chrome to hide during printing; `@media print` styles live in `globals.css`.
- **Commit style**: conventional commits (`feat(scope):`, `fix(scope):`, etc.) where scope matches the Jira ticket (e.g. `PL-3`).
- **LLM calls**: always use Structured Outputs; never parse free-form LLM text to fill document fields.
