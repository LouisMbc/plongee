#!/usr/bin/env bash
set -euo pipefail

# Démarrer rfishbase
cd "$(dirname "$0")/.."

echo "Ensuring rfishbase service is running (no recreate)..."
# Use --no-recreate to avoid attempting to stop/recreate containers which can fail with permission issues
docker-compose up -d --no-recreate rfishbase || {
  echo "docker-compose up failed. You may need to run with sudo or stop the container manually via Docker Desktop." >&2
  echo "Try: sudo docker-compose up -d rfishbase" >&2
  exit 1
}

# Wait for /ping to return status ok (timeout 120s)
TIMEOUT=120
COUNT=0
while true; do
  set +e
  OUT=$(curl -sS http://localhost:8000/ping || true)
  set -e
  if echo "$OUT" | grep -q '"status":"ok"' || echo "$OUT" | grep -q '"status":\["ok"\]'; then
    echo "rfishbase is ready"
    break
  fi
  if [ $COUNT -ge $TIMEOUT ]; then
    echo "Timeout waiting for rfishbase to respond to /ping"
    docker-compose logs rfishbase
    exit 1
  fi
  echo "Waiting for rfishbase... ($COUNT/$TIMEOUT) out=${OUT}"
  COUNT=$((COUNT+5))
  sleep 5
done

# Run the node test
cd ../backend
npm run test:rfishbase || exit $?
