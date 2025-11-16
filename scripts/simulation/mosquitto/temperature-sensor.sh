#!/bin/sh

# Temperature sensor simulator (runs inside Mosquitto container)
# Usage: temperature-sensor.sh [INTERVAL] [TOPIC] [MIN_TEMP] [MAX_TEMP]

INTERVAL=${1:-5}
TOPIC=${2:-sensors/temperature}
MIN_TEMP=${3:-24.0}
MAX_TEMP=${4:-25.0}
BROKER="localhost"
PORT=1883

echo "Temperature sensor simulator started"
echo "Broker: $BROKER:$PORT"
echo "Topic: $TOPIC"
echo "Interval: ${INTERVAL}s"
echo "Temperature range: ${MIN_TEMP}-${MAX_TEMP}°C"
echo "Press Ctrl+C to stop"
echo ""

while true; do
  # Generate random temperature value
  TEMP=$(awk -v min="$MIN_TEMP" -v max="$MAX_TEMP" \
    'BEGIN{srand(); printf "%.1f", min+rand()*(max-min)}')

  # Get timestamp
  TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

  # Build JSON message
  MESSAGE="{\"temperature\": $TEMP, \"timestamp\": \"$TIMESTAMP\", \"unit\": \"celsius\"}"

  # Publish MQTT message
  mosquitto_pub -h "$BROKER" -p "$PORT" -t "$TOPIC" -m "$MESSAGE"

  echo "[$(date +"%H:%M:%S")] Published: $MESSAGE"

  sleep "$INTERVAL"
done
