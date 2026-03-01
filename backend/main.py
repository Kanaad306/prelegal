from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

import database
from routers import health

# Resolve the statically exported Next.js app.
# In Docker: /app/backend/../frontend/out = /app/frontend/out
# In dev:    backend/../frontend/out (only present after npm run build)
STATIC_DIR = Path(__file__).parent.parent / "frontend" / "out"


@asynccontextmanager
async def lifespan(app: FastAPI):
    await database.init_db()
    yield


app = FastAPI(title="Prelegal API", version="1.0.0", lifespan=lifespan)

# API routers — registered before the static file catch-all
app.include_router(health.router, prefix="/api")

# Serve the statically exported Next.js SPA.
# html=True makes FastAPI serve index.html for any path that doesn't match a file.
# Only mounted if the directory exists (not present during local backend-only dev).
if STATIC_DIR.exists():
    app.mount("/", StaticFiles(directory=str(STATIC_DIR), html=True), name="frontend")
