#!/bin/bash

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
DOCKER_DIR="$PROJECT_ROOT/docker"

echo "WARNING: This will stop Node-RED and delete all data (flows, settings, custom nodes)!"
echo ""
read -p "Are you sure you want to continue? (yes/no): " -r
echo

if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
    echo "Reset cancelled."
    exit 0
fi

echo "Stopping Node-RED..."
cd "$DOCKER_DIR"
docker compose down

echo "Removing data directories..."
rm -rf "$DOCKER_DIR/data"
rm -rf "$DOCKER_DIR/hostfiles"

echo ""
echo "✓ Node-RED has been reset"
echo "✓ All data has been deleted"
echo ""
echo "Run './scripts/start.sh' to start with a clean environment"
echo ""
