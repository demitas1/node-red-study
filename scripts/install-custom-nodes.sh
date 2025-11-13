#!/bin/bash

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
DOCKER_DIR="$PROJECT_ROOT/docker"
CUSTOM_NODES_DIR="$PROJECT_ROOT/custom-nodes/node-red-contrib-my-nodes"

echo "Installing custom nodes..."
echo ""

# Check if container is running
if ! docker ps | grep -q nodered; then
    echo "✗ Node-RED container is not running"
    echo "Please start Node-RED first: ./scripts/start.sh"
    exit 1
fi

# Build TypeScript first
echo "Step 1/3: Building TypeScript..."
cd "$CUSTOM_NODES_DIR"
npm run build
echo ""

# Install custom nodes in container
echo "Step 2/3: Running npm install in container..."
docker exec -i nodered bash -c "cd /data && npm install /custom-nodes/node-red-contrib-my-nodes"
echo ""

# Restart Node-RED
echo "Step 3/3: Restarting Node-RED..."
cd "$DOCKER_DIR"
docker compose restart nodered

# Wait for Node-RED to be ready
echo "Waiting for Node-RED to start..."
sleep 3

echo ""
echo "✓ Custom nodes installed successfully!"
echo ""
echo "Access Node-RED at: http://localhost:1880"
echo ""
