# JazzWall Chrome Extension (MVP)

This extension captures audio from the active Google Meet tab and streams it to the JazzWall backend every 2 seconds.

## Includes

- `manifest.json` — Manifest V3 config
- `background.js` — recording lifecycle + stream API calls (`/api/stream/start`, `/chunk`, `/stop`)
- `content.js` — Meet UI overlays (translation + live action items placeholders)
- `popup.html` + `popup.js` — start/stop controls and status
- `icons/` — placeholder extension icons (16/32/48/128)

## Load locally

1. Open `chrome://extensions`
2. Enable **Developer mode**
3. Click **Load unpacked**
4. Select the `extension/` folder

## MVP usage

1. Join a Google Meet call (`https://meet.google.com/...`)
2. Open the JazzWall extension popup
3. Set:
   - Backend URL (`http://localhost:3001` or Railway URL)
   - Clerk JWT token (Bearer token value)
   - Meet URL
4. Click **Start recording**
5. Click **Stop recording** when done

## Notes

- The popup currently expects a Clerk JWT to be pasted for backend auth.
- `content.js` overlay UI is wired as a Phase 2 visual shell; transcript/action-item updates can be pushed via extension runtime messages.
- For production, restrict host permissions to your exact Railway domain.
