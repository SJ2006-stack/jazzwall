# QA Smoke Scripts

## `qa-smoke-stream.sh`

Runs an end-to-end smoke test against the stream backend:

1. `GET /health`
2. `POST /api/stream/start`
3. Socket.IO handshake + `join` + wait for `ready`
4. `POST /api/stream/stop`
5. Invalid `meetingId` validation (`400` expected)

### Usage

From `backend-Jazz/`:

```bash
npm run qa:smoke
```

Optional environment overrides:

```bash
BASE_URL=https://jazzwall-production.up.railway.app
USER_ID=user_qa_socket
MEET_URL=https://meet.google.com/qa-test
npm run qa:smoke
```
