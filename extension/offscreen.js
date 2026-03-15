const offscreenState = {
  meetingId: null,
  userId: null,
  backendUrl: null,
  recorder: null,
  stream: null,
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

function cleanupRecorderState() {
  if (offscreenState.stream) {
    for (const track of offscreenState.stream.getTracks()) {
      track.stop()
    }
  }

  offscreenState.recorder = null
  offscreenState.stream = null
}

async function sendChunk(blob) {
  if (!offscreenState.meetingId || !offscreenState.userId || !offscreenState.backendUrl) return

  const chunkBase64 = await toBase64(blob)

  await fetchJson(`${offscreenState.backendUrl}/api/stream/chunk`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      meetingId: offscreenState.meetingId,
      userId: offscreenState.userId,
      chunkBase64,
      mimeType: blob.type || 'audio/webm',
      timestamp: Date.now(),
    }),
  })
}

async function startOffscreenRecording(payload) {
  const { streamId, meetingId, userId, backendUrl, chunkMs } = payload || {}

  if (!streamId || !meetingId || !userId || !backendUrl) {
    throw new Error('streamId, meetingId, userId, and backendUrl are required')
  }

  if (offscreenState.recorder && offscreenState.recorder.state !== 'inactive') {
    throw new Error('Offscreen recorder already active')
  }

  const stream = await navigator.mediaDevices.getUserMedia({
    audio: {
      mandatory: {
        chromeMediaSource: 'tab',
        chromeMediaSourceId: streamId,
      },
    },
    video: false,
  })

  const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
    ? 'audio/webm;codecs=opus'
    : 'audio/webm'

  const recorder = new MediaRecorder(stream, { mimeType })

  offscreenState.meetingId = meetingId
  offscreenState.userId = userId
  offscreenState.backendUrl = backendUrl
  offscreenState.stream = stream
  offscreenState.recorder = recorder

  recorder.ondataavailable = async (event) => {
    if (!event.data || event.data.size === 0) return

    try {
      await sendChunk(event.data)
    } catch (err) {
      console.error('[JazzWall/offscreen] chunk upload failed', err)
    }
  }

  recorder.onstop = () => {
    cleanupRecorderState()
    chrome.runtime.sendMessage({ type: 'OFFSCREEN_STOPPED' }).catch(() => {})
  }

  recorder.start(chunkMs || 2000)

  return { success: true }
}

async function stopOffscreenRecording() {
  if (!offscreenState.recorder || offscreenState.recorder.state === 'inactive') {
    cleanupRecorderState()
    return { success: true }
  }

  offscreenState.recorder.stop()
  return { success: true }
}

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
