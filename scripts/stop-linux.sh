#!/usr/bin/env bash
set -euo pipefail

CONTAINER_NAME="prelegal"

if docker inspect "${CONTAINER_NAME}" &>/dev/null; then
    echo "[prelegal] Stopping container '${CONTAINER_NAME}' ..."
    docker stop "${CONTAINER_NAME}"
    docker rm   "${CONTAINER_NAME}"
    echo "[prelegal] Stopped."
else
    echo "[prelegal] No container named '${CONTAINER_NAME}' is running."
fi

# Volume 'prelegal-data' is intentionally retained so SQLite data persists between runs.
# To wipe data: docker volume rm prelegal-data
