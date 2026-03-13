async function getClerkToken() {
  try {
    const clerk = window.Clerk || window.__clerk

    if (!clerk || !clerk.session) {
      return { success: false, error: 'Clerk session not found. Please sign in on JazzWall first.' }
    }

    const token = await clerk.session.getToken()

    if (!token) {
      return { success: false, error: 'Could not retrieve Clerk token from session.' }
    }

    return { success: true, token }
  } catch (err) {
    return { success: false, error: err?.message || 'Failed to retrieve Clerk token.' }
  }
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type !== 'JAZZWALL_GET_CLERK_TOKEN') {
    return
  }

  getClerkToken().then(sendResponse)
  return true
})
