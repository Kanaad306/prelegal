# ── Stage 1: Build Next.js static export ──────────────────────────────────────
FROM node:22-alpine AS node-builder

WORKDIR /build/frontend

# Install dependencies (layer-cached until package.json changes)
COPY frontend/package.json frontend/package-lock.json* ./
RUN npm ci --prefer-offline

# Copy source and build static export
COPY frontend/ ./
RUN npm run build
# Output: /build/frontend/out/

# ── Stage 2: Python runtime ───────────────────────────────────────────────────
FROM python:3.12-slim AS python-runner

# Install uv
COPY --from=ghcr.io/astral-sh/uv:latest /uv /usr/local/bin/uv

WORKDIR /app

# Copy backend source
COPY backend/ ./backend/

# Copy built frontend static export
COPY --from=node-builder /build/frontend/out ./frontend/out/

# Install Python dependencies (no venv needed in a container)
RUN uv pip install --system --no-cache ./backend/

# Volume mount point for SQLite database persistence
RUN mkdir -p /data

ENV PRELEGAL_DB_PATH=/data/prelegal.db
ENV PYTHONPATH=/app/backend

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/api/health')"

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--app-dir", "/app/backend"]
