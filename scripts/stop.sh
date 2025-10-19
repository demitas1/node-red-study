#!/bin/bash

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
DOCKER_DIR="$PROJECT_ROOT/docker"

echo "Stopping Node-RED..."

cd "$DOCKER_DIR"
docker compose down

echo ""
echo "✓ Node-RED has been stopped"
echo ""
