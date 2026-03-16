const CHUNK_MS = 250
const OFFSCREEN_DOCUMENT_PATH = 'offscreen.html'

const state = {
  isRecording: false,
  meetingId: null,
  meetingUrl: null,
  userId: null,
  meetingToken: null,
  backendUrl: null,
  activeTabId: null,
}

let creatingOffscreenDocument

async function storageGet(keys) {
  return chrome.storage.local.get(keys)
}

async function storageSet(values) {
  return chrome.storage.local.set(values)
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

async function ensureOffscreenDocument() {
  if (!chrome.offscreen?.createDocument) {
    throw new Error('Offscreen API unavailable. Please update Chrome to latest version.')
  }

  if (chrome.offscreen.hasDocument) {
    const hasDoc = await chrome.offscreen.hasDocument()
    if (hasDoc) return
  }

  if (creatingOffscreenDocument) {
    await creatingOffscreenDocument
    return
  }

  creatingOffscreenDocument = chrome.offscreen.createDocument({
    url: OFFSCREEN_DOCUMENT_PATH,
    reasons: ['USER_MEDIA'],
    justification: 'Capture Google Meet tab audio for JazzWall recording',
  })

  try {
    await creatingOffscreenDocument
  } finally {
    creatingOffscreenDocument = null
  }
}

async function getMediaStreamIdForTab(tabId) {
  return new Promise((resolve, reject) => {
    chrome.tabCapture.getMediaStreamId({
      targetTabId: tabId,
    }, (streamId) => {
      const chromeError = chrome.runtime.lastError
      if (chromeError) {
        reject(new Error(chromeError.message))
        return
      }

      if (!streamId) {
        reject(new Error('Could not create media stream id for Meet tab'))
        return
      }

      resolve(streamId)
    })
  })
}

function resetState() {
  state.isRecording = false
  state.meetingId = null
  state.meetingUrl = null
  state.userId = null
  state.meetingToken = null
  state.activeTabId = null
}

async function stopMeeting() {
  // Snapshot values before reset clears state
  const meetingId = state.meetingId
  const userId = state.userId
  const backendUrl = state.backendUrl

  try {
    await chrome.runtime.sendMessage({ type: 'OFFSCREEN_STOP' })
  } catch (err) {
    console.warn('[JazzWall] offscreen stop warning:', err?.message || err)
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

  await ensureOffscreenDocument()

  const streamId = await getMediaStreamIdForTab(activeTabId)

  const offscreenStart = await chrome.runtime.sendMessage({
    type: 'OFFSCREEN_START',
    payload: {
      streamId,
      meetingId,
      userId,
      backendUrl,
      chunkMs: CHUNK_MS,
    },
  })

  if (!offscreenStart?.success) {
    throw new Error(offscreenStart?.error || 'Could not start audio capture')
  }

  state.isRecording = true
  state.meetingId = meetingId
  state.meetingUrl = meetingUrl
  state.userId = userId
  state.meetingToken = meetingToken || null
  state.backendUrl = backendUrl
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
    recorderState: { isRecording: false, meetingId: null },
  })
})

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type === 'OFFSCREEN_START' || message?.type === 'OFFSCREEN_STOP') {
    return false
  }

  ;(async () => {
    try {
      if (message?.type === 'OFFSCREEN_STOPPED') {
        const meetingId = state.meetingId
        const userId = state.userId
        const backendUrl = state.backendUrl

        resetState()
        await storageSet({ recorderState: { isRecording: false, meetingId: null } })

        if (meetingId && userId && backendUrl) {
          await fetchJson(`${backendUrl}/api/stream/stop`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ meetingId, userId }),
          })
        }

        sendResponse({ success: true })
        return
      }

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
