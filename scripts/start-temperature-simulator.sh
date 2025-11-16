#!/bin/bash

# Wrapper to start temperature sensor simulator from host
# Usage: start-temperature-simulator.sh [INTERVAL] [TOPIC] [MIN_TEMP] [MAX_TEMP]

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

INTERVAL=${1:-5}
TOPIC=${2:-sensors/temperature}
MIN_TEMP=${3:-24.0}
MAX_TEMP=${4:-25.0}

echo "Starting temperature sensor simulator..."
echo "Interval: ${INTERVAL}s"
echo "Topic: $TOPIC"
echo "Temperature range: ${MIN_TEMP}-${MAX_TEMP}°C"
echo ""

cd "$PROJECT_ROOT/docker" || exit 1

# Execute script inside Mosquitto container
docker compose exec mosquitto /scripts/temperature-sensor.sh \
  "$INTERVAL" "$TOPIC" "$MIN_TEMP" "$MAX_TEMP"
