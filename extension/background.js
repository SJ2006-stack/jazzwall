const CHUNK_MS = 2000

const state = {
  isRecording: false,
  meetingId: null,
  meetingUrl: null,
  userId: null,
  meetingToken: null,
  backendUrl: null,
  mediaRecorder: null,
  stream: null,
  activeTabId: null,
}

async function storageGet(keys) {
  return chrome.storage.local.get(keys)
}

async function storageSet(values) {
  return chrome.storage.local.set(values)
}

function toBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => {
      const result = reader.result || ''
      const base64 = String(result).split(',')[1] || ''
      resolve(base64)
    }
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

async function fetchJson(url, options) {
  const res = await fetch(url, options)
  const text = await res.text()
  let body

  try {
    body = text ? JSON.parse(text) : {}
  } catch {
    body = { raw: text }
  }

  if (!res.ok) {
    throw new Error(body.error || `HTTP ${res.status}`)
  }

  return body
}

async function sendChunk(blob) {
  if (!state.meetingId || !state.userId || !state.backendUrl) return

  const chunkBase64 = await toBase64(blob)

  await fetchJson(`${state.backendUrl}/api/stream/chunk`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      meetingId: state.meetingId,
      userId: state.userId,
      chunkBase64,
      mimeType: blob.type || 'audio/webm',
      timestamp: Date.now(),
    }),
  })
}

function resetState() {
  if (state.mediaRecorder && state.mediaRecorder.state !== 'inactive') {
    state.mediaRecorder.stop()
  }

  if (state.stream) {
    for (const track of state.stream.getTracks()) {
      track.stop()
    }
  }

  state.isRecording = false
  state.meetingId = null
  state.meetingUrl = null
  state.userId = null
  state.meetingToken = null
  state.mediaRecorder = null
  state.stream = null
  state.activeTabId = null
}

async function stopMeeting() {
  // Snapshot values before reset clears state
  const meetingId = state.meetingId
  const userId = state.userId
  const backendUrl = state.backendUrl

  // Avoid duplicate /stop call when stop() triggers recorder.onstop
  if (state.mediaRecorder) {
    state.mediaRecorder.onstop = null
  }

  resetState()
  await storageSet({ recorderState: { isRecording: false, meetingId: null } })

  if (!meetingId || !userId || !backendUrl) return { success: true }

  return fetchJson(`${backendUrl}/api/stream/stop`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      meetingId,
      userId,
    }),
  })
}

async function startRecording({ backendUrl, userId, meetingToken, meetingUrl, activeTabId }) {
  if (state.isRecording) {
    throw new Error('Recording already active')
  }

  if (!backendUrl || !userId || !meetingUrl) {
    throw new Error('backendUrl, userId, and meetingUrl are required')
  }

  if (!activeTabId) {
    throw new Error('Active Meet tab not found. Open Meet tab and try again.')
  }

  const meetingId = crypto.randomUUID()

  await fetchJson(`${backendUrl}/api/stream/start`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      meetingId,
      userId,
      meetUrl: meetingUrl,
    }),
  })

  const stream = await new Promise((resolve, reject) => {
    chrome.tabCapture.capture({
      audio: true,
      video: false,
      tabId: activeTabId,
    }, (capturedStream) => {
      const chromeError = chrome.runtime.lastError
      if (chromeError) {
        reject(new Error(chromeError.message))
        return
      }
      if (!capturedStream) {
        reject(new Error('Could not capture tab audio — make sure you are on the Meet tab'))
        return
      }
      resolve(capturedStream)
    })
  })

  const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
    ? 'audio/webm;codecs=opus'
    : 'audio/webm'

  const recorder = new MediaRecorder(stream, { mimeType })

  recorder.ondataavailable = async (event) => {
    if (!event.data || event.data.size === 0) return
    try {
      await sendChunk(event.data)
    } catch (err) {
      console.error('[JazzWall] chunk upload failed', err)
    }
  }

  recorder.onstop = async () => {
    const meetingIdSnapshot = state.meetingId
    const userIdSnapshot = state.userId
    const backendUrlSnapshot = state.backendUrl

    resetState()
    await storageSet({ recorderState: { isRecording: false, meetingId: null } })

    if (meetingIdSnapshot && userIdSnapshot && backendUrlSnapshot) {
      fetchJson(`${backendUrlSnapshot}/api/stream/stop`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ meetingId: meetingIdSnapshot, userId: userIdSnapshot }),
      }).catch((err) => console.error('[JazzWall] stop failed', err))
    }
  }

  recorder.start(CHUNK_MS)

  state.isRecording = true
  state.meetingId = meetingId
  state.meetingUrl = meetingUrl
  state.userId = userId
  state.meetingToken = meetingToken || null
  state.backendUrl = backendUrl
  state.mediaRecorder = recorder
  state.stream = stream
  state.activeTabId = activeTabId || null

  await storageSet({
    recorderState: {
      isRecording: true,
      meetingId,
      userId,
      meetingUrl,
      startedAt: Date.now(),
    },
  })

  return { success: true, meetingId }
}

chrome.runtime.onInstalled.addListener(async () => {
  await storageSet({
    backendUrl: 'http://localhost:3001',
    recorderState: { isRecording: false, meetingId: null },
  })
})

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  ;(async () => {
    try {
      if (message?.type === 'START_RECORDING') {
        const response = await startRecording(message.payload || {})
        sendResponse(response)
        return
      }

      if (message?.type === 'STOP_RECORDING') {
        const response = await stopMeeting()
        sendResponse(response)
        return
      }

      if (message?.type === 'GET_STATUS') {
        const { recorderState } = await storageGet(['recorderState'])
        sendResponse({
          success: true,
          ...(recorderState || { isRecording: false, meetingId: null }),
        })
        return
      }

      sendResponse({ success: false, error: 'Unknown message type' })
    } catch (err) {
      sendResponse({ success: false, error: err.message })
    }
  })()

  return true
})
