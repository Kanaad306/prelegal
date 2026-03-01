#!/usr/bin/env bash
set -euo pipefail

CONTAINER_NAME="prelegal"
IMAGE_NAME="prelegal:latest"
VOLUME_NAME="prelegal-data"
HOST_PORT="${PORT:-8000}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

echo "[prelegal] Building image ${IMAGE_NAME} ..."
docker build -t "${IMAGE_NAME}" "${REPO_ROOT}"

# Stop and remove any existing container with this name (idempotent restart)
if docker inspect "${CONTAINER_NAME}" &>/dev/null; then
    echo "[prelegal] Stopping existing container '${CONTAINER_NAME}' ..."
    docker stop "${CONTAINER_NAME}" || true
    docker rm   "${CONTAINER_NAME}" || true
fi

# Create named volume if it does not already exist (persists SQLite data)
if ! docker volume inspect "${VOLUME_NAME}" &>/dev/null; then
    echo "[prelegal] Creating volume '${VOLUME_NAME}' ..."
    docker volume create "${VOLUME_NAME}"
fi

echo "[prelegal] Starting container '${CONTAINER_NAME}' on port ${HOST_PORT} ..."
docker run -d \
    --name "${CONTAINER_NAME}" \
    -p "${HOST_PORT}:8000" \
    -v "${VOLUME_NAME}:/data" \
    "${IMAGE_NAME}"

echo "[prelegal] Running at http://localhost:${HOST_PORT}"
echo "[prelegal] Health:  http://localhost:${HOST_PORT}/api/health"
