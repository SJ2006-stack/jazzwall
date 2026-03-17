// ─── JazzWall Offscreen Document ─────────────────────────────────────────────
// Runs in the offscreen document context.
// Captures tab audio via getUserMedia (tabCapture stream),
// streams raw binary chunks to the backend via Socket.io,
// which pipes them to Deepgram Live for real-time transcription.

// socket.io-client is loaded as a <script> tag in offscreen.html before this file.

const offscreenState = {
  meetingId: null,
  userId: null,
  backendUrl: null,
  recorder: null,
  stream: null,
  socket: null,
}

function cleanupRecorderState() {
  if (offscreenState.stream) {
    for (const track of offscreenState.stream.getTracks()) {
      track.stop()
    }
  }
  offscreenState.recorder = null
  offscreenState.stream = null
}

function cleanupSocket() {
  if (offscreenState.socket) {
    try { offscreenState.socket.disconnect() } catch {}
    offscreenState.socket = null
  }
}

async function startOffscreenRecording(payload) {
  const { streamId, meetingId, userId, backendUrl, chunkMs } = payload || {}

  if (!streamId || !meetingId || !userId || !backendUrl) {
    throw new Error('streamId, meetingId, userId, and backendUrl are required')
  }

  if (offscreenState.recorder && offscreenState.recorder.state !== 'inactive') {
    throw new Error('Offscreen recorder already active')
  }

  // ── 1. Grab the tab audio stream ──────────────────────────────────────────
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: {
      mandatory: {
        chromeMediaSource: 'tab',
        chromeMediaSourceId: streamId,
      },
    },
    video: false,
  })

  const [audioTrack] = stream.getAudioTracks()
  if (audioTrack) {
    audioTrack.onended = () => {
      console.warn('[JazzWall/offscreen] Meet audio track ended; stopping recorder')
      if (offscreenState.recorder && offscreenState.recorder.state !== 'inactive') {
        offscreenState.recorder.stop()
      } else {
        cleanupRecorderState()
        cleanupSocket()
        chrome.runtime.sendMessage({ type: 'OFFSCREEN_STOPPED' }).catch(() => {})
      }
    }
  }

  // ── 2. Connect Socket.io to backend ───────────────────────────────────────
  // io() is provided by the socket.io-client CDN script in offscreen.html
  const socket = io(backendUrl, {
    transports: ['websocket'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  })

  offscreenState.socket = socket

  socket.on('connect', () => {
    console.log('[JazzWall/offscreen] Socket connected, joining meeting', meetingId)
    socket.emit('join', { meetingId, userId })
  })

  socket.on('ready', (data) => {
    console.log('[JazzWall/offscreen] Deepgram ready:', data.message)
    // Start recording only after Deepgram confirms it's open
    startMediaRecorder(stream, socket, chunkMs)
  })

  socket.on('transcript', (data) => {
    // Forward interim + final transcripts to background service worker
    chrome.runtime.sendMessage({
      type: 'TRANSCRIPT_UPDATE',
      payload: { text: data.text, speaker: data.speaker, isFinal: data.isFinal, timestamp: data.timestamp },
    }).catch(() => {})
  })

  socket.on('stream-error', (data) => {
    console.error('[JazzWall/offscreen] Server error:', data.message)
    chrome.runtime.sendMessage({
      type: 'SOCKET_ERROR',
      payload: { message: data.message },
    }).catch(() => {})
  })

  socket.on('disconnect', (reason) => {
    console.warn('[JazzWall/offscreen] Socket disconnected:', reason)
  })

  offscreenState.meetingId = meetingId
  offscreenState.userId = userId
  offscreenState.backendUrl = backendUrl
  offscreenState.stream = stream

  return { success: true }
}

function startMediaRecorder(stream, socket, chunkMs) {
  const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
    ? 'audio/webm;codecs=opus'
    : 'audio/webm'

  const recorder = new MediaRecorder(stream, { mimeType })

  offscreenState.recorder = recorder

  recorder.ondataavailable = async (event) => {
    if (!event.data || event.data.size === 0) return
    if (!offscreenState.socket || !offscreenState.socket.connected) return

    try {
      // Convert Blob → ArrayBuffer → send as binary over socket
      const arrayBuffer = await event.data.arrayBuffer()
      offscreenState.socket.emit('audio-chunk', arrayBuffer)
    } catch (err) {
      console.error('[JazzWall/offscreen] audio-chunk send failed', err)
    }
  }

  recorder.onstop = () => {
    cleanupRecorderState()
    cleanupSocket()
    chrome.runtime.sendMessage({ type: 'OFFSCREEN_STOPPED' }).catch(() => {})
  }

  // 100 ms timeslice — continuous byte stream to Deepgram, no header fragmentation
  recorder.start(chunkMs || 100)
  console.log('[JazzWall/offscreen] MediaRecorder started at', chunkMs || 250, 'ms timeslice')
}

async function stopOffscreenRecording() {
  if (!offscreenState.recorder || offscreenState.recorder.state === 'inactive') {
    cleanupRecorderState()
    cleanupSocket()
    return { success: true }
  }

  offscreenState.recorder.stop()
  return { success: true }
}

// ─── Message listener ─────────────────────────────────────────────────────────
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  ;(async () => {
    try {
      if (message?.type === 'OFFSCREEN_START') {
        const response = await startOffscreenRecording(message.payload)
        sendResponse(response)
        return
      }

      if (message?.type === 'OFFSCREEN_STOP') {
        const response = await stopOffscreenRecording()
        sendResponse(response)
        return
      }
    } catch (err) {
      sendResponse({ success: false, error: err?.message || 'Offscreen recorder error' })
    }
  })()

  return true
})
