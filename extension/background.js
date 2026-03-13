const CHUNK_MS = 2000

const state = {
  isRecording: false,
  meetingId: null,
  meetingUrl: null,
  token: null,
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
  if (!state.meetingId || !state.token || !state.backendUrl) return

  const chunkBase64 = await toBase64(blob)

  await fetchJson(`${state.backendUrl}/api/stream/chunk`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${state.token}`,
    },
    body: JSON.stringify({
      meetingId: state.meetingId,
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
  state.mediaRecorder = null
  state.stream = null
  state.activeTabId = null
}

async function stopMeeting() {
  const meetingId = state.meetingId

  resetState()
  await storageSet({ recorderState: { isRecording: false, meetingId: null } })

  if (!meetingId || !state.token || !state.backendUrl) return { success: true }

  return fetchJson(`${state.backendUrl}/api/stream/stop`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${state.token}`,
    },
    body: JSON.stringify({ meetingId }),
  })
}

async function startRecording({ backendUrl, token, meetingUrl, activeTabId }) {
  if (state.isRecording) {
    throw new Error('Recording already active')
  }

  if (!backendUrl || !token || !meetingUrl) {
    throw new Error('backendUrl, token, and meetingUrl are required')
  }

  const meetingId = crypto.randomUUID()

  await fetchJson(`${backendUrl}/api/stream/start`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      meetingId,
      meetUrl: meetingUrl,
    }),
  })

  const stream = await new Promise((resolve, reject) => {
    chrome.tabCapture.capture({
      audio: true,
      video: false,
    }, (capturedStream) => {
      const chromeError = chrome.runtime.lastError
      if (chromeError) {
        reject(new Error(chromeError.message))
        return
      }
      if (!capturedStream) {
        reject(new Error('Could not capture tab audio'))
        return
      }
      resolve(capturedStream)
    })
  })

  const recorder = new MediaRecorder(stream, {
    mimeType: 'audio/webm;codecs=opus',
  })

  recorder.ondataavailable = async (event) => {
    if (!event.data || event.data.size === 0) return
    try {
      await sendChunk(event.data)
    } catch (err) {
      console.error('[JazzWall] chunk upload failed', err)
    }
  }

  recorder.onstop = () => {
    stopMeeting().catch((err) => console.error('[JazzWall] stop failed', err))
  }

  recorder.start(CHUNK_MS)

  state.isRecording = true
  state.meetingId = meetingId
  state.meetingUrl = meetingUrl
  state.token = token
  state.backendUrl = backendUrl
  state.mediaRecorder = recorder
  state.stream = stream
  state.activeTabId = activeTabId || null

  await storageSet({
    recorderState: {
      isRecording: true,
      meetingId,
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
