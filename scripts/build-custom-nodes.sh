#!/bin/bash

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
CUSTOM_NODES_DIR="$PROJECT_ROOT/custom-nodes/node-red-contrib-my-nodes"

echo "Building custom nodes (TypeScript)..."
echo ""

# Check if custom nodes directory exists
if [ ! -d "$CUSTOM_NODES_DIR" ]; then
    echo "✗ Custom nodes directory not found: $CUSTOM_NODES_DIR"
    exit 1
fi

# Build TypeScript
cd "$CUSTOM_NODES_DIR"
echo "Running npm run build..."
npm run build

echo ""
echo "✓ Custom nodes built successfully!"
echo ""
echo "Build output: $CUSTOM_NODES_DIR/dist/"
echo ""
echo "Next steps:"
echo "  - To install in Node-RED: ./scripts/install-custom-nodes.sh"
echo "  - To reload after changes: ./scripts/reload-custom-nodes.sh"
echo ""
