const backendUrlInput = document.getElementById('backendUrl')
const authTokenInput = document.getElementById('authToken')
const meetingUrlInput = document.getElementById('meetingUrl')
const startBtn = document.getElementById('startBtn')
const stopBtn = document.getElementById('stopBtn')
const statusEl = document.getElementById('status')
const errorEl = document.getElementById('error')

function showError(message = '') {
  errorEl.textContent = message
}

function setStatus(message) {
  statusEl.textContent = `Status: ${message}`
}

async function storageGet(keys) {
  return chrome.storage.local.get(keys)
}

async function storageSet(values) {
  return chrome.storage.local.set(values)
}

async function getActiveTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
  return tab
}

async function refreshStatus() {
  const response = await chrome.runtime.sendMessage({ type: 'GET_STATUS' })
  if (!response?.success) return

  if (response.isRecording) {
    setStatus(`Recording • meeting ${response.meetingId}`)
  } else {
    setStatus('Idle')
  }
}

async function loadSavedSettings() {
  const data = await storageGet(['backendUrl', 'authToken'])
  backendUrlInput.value = data.backendUrl || 'http://localhost:3001'
  authTokenInput.value = data.authToken || ''

  const tab = await getActiveTab()
  if (tab?.url?.includes('meet.google.com')) {
    meetingUrlInput.value = tab.url
  }
}

startBtn.addEventListener('click', async () => {
  showError('')

  const backendUrl = backendUrlInput.value.trim()
  const token = authTokenInput.value.trim()
  const meetingUrl = meetingUrlInput.value.trim()

  if (!backendUrl || !token || !meetingUrl) {
    showError('backend URL, Clerk token, and Meet URL are required.')
    return
  }

  try {
    await storageSet({ backendUrl, authToken: token })
    const tab = await getActiveTab()

    const response = await chrome.runtime.sendMessage({
      type: 'START_RECORDING',
      payload: {
        backendUrl,
        token,
        meetingUrl,
        activeTabId: tab?.id || null,
      },
    })

    if (!response?.success) {
      throw new Error(response?.error || 'Could not start recording')
    }

    setStatus(`Recording • meeting ${response.meetingId}`)
  } catch (err) {
    showError(err.message || 'Failed to start recording')
  }
})

stopBtn.addEventListener('click', async () => {
  showError('')
  try {
    const response = await chrome.runtime.sendMessage({ type: 'STOP_RECORDING' })
    if (!response?.success) {
      throw new Error(response?.error || 'Could not stop recording')
    }
    setStatus('Stopped')
  } catch (err) {
    showError(err.message || 'Failed to stop recording')
  }
})

document.addEventListener('DOMContentLoaded', async () => {
  await loadSavedSettings()
  await refreshStatus()
})
