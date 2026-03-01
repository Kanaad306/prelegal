from importlib.metadata import version as pkg_version

from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(tags=["health"])


class HealthResponse(BaseModel):
    status: str
    version: str


@router.get("/health", response_model=HealthResponse)
async def health_check() -> HealthResponse:
    """Liveness probe. Returns 200 immediately with no external dependencies."""
    return HealthResponse(status="ok", version=pkg_version("prelegal-backend"))
