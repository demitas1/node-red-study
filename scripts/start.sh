#!/bin/bash

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
DOCKER_DIR="$PROJECT_ROOT/docker"

echo "Starting Node-RED..."

# Create necessary directories with current user ownership
mkdir -p "$DOCKER_DIR/data"
mkdir -p "$DOCKER_DIR/hostfiles"

# Export UID and GID for docker-compose
export PUID=$(id -u)
export PGID=$(id -g)

# Start Docker Compose
cd "$DOCKER_DIR"
docker compose up -d

# Wait for Node-RED to be ready
echo "Waiting for Node-RED to start..."
sleep 3

# Check if container is running
if docker compose ps | grep -q "nodered.*Up"; then
    echo ""
    echo "✓ Node-RED is running!"
    echo ""
    echo "Access Node-RED at: http://localhost:1880"
    echo ""
    echo "To view logs: docker compose -f $DOCKER_DIR/docker-compose.yml logs -f nodered"
    echo "To stop: docker compose -f $DOCKER_DIR/docker-compose.yml down"
else
    echo "✗ Failed to start Node-RED"
    echo "Check logs with: docker compose -f $DOCKER_DIR/docker-compose.yml logs"
    exit 1
fi
