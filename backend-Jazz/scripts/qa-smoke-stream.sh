#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${BASE_URL:-https://jazzwall-production.up.railway.app}"
USER_ID="${USER_ID:-user_qa_socket}"
MEET_URL="${MEET_URL:-https://meet.google.com/qa-test}"

uuid() {
  python3 - <<'PY'
import uuid
print(uuid.uuid4())
PY
}

expect_status() {
  local expected="$1"
  local actual="$2"
  local label="$3"
  if [[ "$actual" != "$expected" ]]; then
    echo "❌ $label failed (expected HTTP $expected, got $actual)"
    exit 1
  fi
  echo "✅ $label (HTTP $actual)"
}

echo "== JazzWall stream smoke QA =="
echo "BASE_URL=$BASE_URL"
echo "USER_ID=$USER_ID"

# 1) Health
HEALTH_STATUS=$(curl -sS -o /tmp/jazz_health.json -w "%{http_code}" "$BASE_URL/health")
expect_status "200" "$HEALTH_STATUS" "health"

# 2) Create meeting
START_STATUS=$(curl -sS -o /tmp/jazz_start.json -w "%{http_code}" \
  -X POST "$BASE_URL/api/stream/start" \
  -H 'Content-Type: application/json' \
  --data "{\"userId\":\"$USER_ID\",\"meetUrl\":\"$MEET_URL\"}")
expect_status "200" "$START_STATUS" "stream/start"

# Extract the meetingId from the JSON response (requires jq or python)
MEETING_ID=$(python3 -c "import sys, json; print(json.load(sys.stdin).get('meetingId', ''))" < /tmp/jazz_start.json)
if [[ -z "$MEETING_ID" ]]; then
  echo "❌ Failed to extract meetingId from start response"
  exit 1
fi

# 3) Socket.IO handshake + join + ready
HANDSHAKE=$(curl -sS "$BASE_URL/socket.io/?EIO=4&transport=polling")
SID=$(echo "$HANDSHAKE" | sed -E 's/^0\{"sid":"([^"]+)".*/\1/')
if [[ -z "$SID" || "$SID" == "$HANDSHAKE" ]]; then
  echo "❌ socket handshake failed (sid parse)"
  echo "$HANDSHAKE"
  exit 1
fi

echo "Socket SID: $SID"

curl -sS -X POST "$BASE_URL/socket.io/?EIO=4&transport=polling&sid=$SID" \
  -H 'Content-Type: text/plain;charset=UTF-8' \
  --data '40' >/dev/null

JOIN_PAYLOAD=$(printf '42["join",{"meetingId":"%s","userId":"%s"}]' "$MEETING_ID" "$USER_ID")
curl -sS -X POST "$BASE_URL/socket.io/?EIO=4&transport=polling&sid=$SID" \
  -H 'Content-Type: text/plain;charset=UTF-8' \
  --data "$JOIN_PAYLOAD" >/dev/null

READY_FOUND=0
for i in $(seq 1 20); do
  RESP=$(curl -sS "$BASE_URL/socket.io/?EIO=4&transport=polling&sid=$SID&t=qa$i")
  if echo "$RESP" | grep -F '42["ready"' >/dev/null; then
    READY_FOUND=1
    break
  fi
  sleep 0.5
done

if [[ "$READY_FOUND" != "1" ]]; then
  echo "❌ socket ready event not observed"
  exit 1
fi
echo "✅ socket ready event observed"

# 4) Stop meeting
STOP_STATUS=$(curl -sS -o /tmp/jazz_stop.json -w "%{http_code}" \
  -X POST "$BASE_URL/api/stream/stop" \
  -H 'Content-Type: application/json' \
  --data "{\"meetingId\":\"$MEETING_ID\",\"userId\":\"$USER_ID\"}")
expect_status "200" "$STOP_STATUS" "stream/stop"

# 5) Invalid meetingId check (should be 400)
INVALID_STATUS=$(curl -sS -o /tmp/jazz_invalid_stop.json -w "%{http_code}" \
  -X POST "$BASE_URL/api/stream/stop" \
  -H 'Content-Type: application/json' \
  --data '{"meetingId":"not-a-uuid","userId":"$USER_ID"}')
expect_status "400" "$INVALID_STATUS" "invalid meetingId validation"

echo "🎉 Smoke QA passed"
