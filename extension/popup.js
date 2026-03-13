const backendUrlInput = document.getElementById('backendUrl')
const meetingUrlInput = document.getElementById('meetingUrl')
const startBtn = document.getElementById('startBtn')
const stopBtn = document.getElementById('stopBtn')
const statusEl = document.getElementById('status')
const errorEl = document.getElementById('error')

const JAZZWALL_ORIGIN = 'https://jazzwall.vercel.app'

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
  const data = await storageGet(['backendUrl'])
  backendUrlInput.value = data.backendUrl || 'http://localhost:3001'

  const tab = await getActiveTab()
  if (tab?.url?.includes('meet.google.com')) {
    meetingUrlInput.value = tab.url
  }
}

async function findJazzWallTab() {
  const tabs = await chrome.tabs.query({ url: [`${JAZZWALL_ORIGIN}/*`, 'http://localhost:3000/*'] })
  return tabs.find((tab) => Boolean(tab.id)) || null
}

async function fetchTokenFromJazzWallTab() {
  const tab = await findJazzWallTab()

  if (!tab?.id) {
    throw new Error('Open jazzwall.vercel.app in a tab and sign in first.')
  }

  const response = await chrome.tabs.sendMessage(tab.id, {
    type: 'JAZZWALL_GET_CLERK_TOKEN',
  })

  if (!response?.success || !response.token) {
    throw new Error(response?.error || 'Could not fetch auth token from JazzWall tab.')
  }

  return response.token
}

startBtn.addEventListener('click', async () => {
  showError('')

  const backendUrl = backendUrlInput.value.trim()
  const meetingUrl = meetingUrlInput.value.trim()

  if (!backendUrl || !meetingUrl) {
    showError('backend URL and Meet URL are required.')
    return
  }

  try {
    const token = await fetchTokenFromJazzWallTab()

    await storageSet({ backendUrl })
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
