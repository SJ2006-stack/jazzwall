const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://jazzwall-production.up.railway.app"

/** Parse JSON safely — throws a human-readable error if Railway returns an HTML page (cold start / 503). */
async function safeJson(res: Response) {
  const ct = res.headers.get('content-type') ?? ''
  if (!ct.includes('application/json')) {
    throw new Error(
      res.status === 503
        ? 'Backend is waking up — please try again in a few seconds.'
        : `Backend returned HTTP ${res.status} (expected JSON).`
    )
  }
  return res.json()
}

export const api = {
  startStream: async (payload: {
    meetingId: string
    meetUrl?: string
    languageHint?: string
  }, token: string) => {
    const res = await fetch(`${API_URL}/api/stream/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    })
    return safeJson(res)
  },

  sendChunk: async (payload: {
    meetingId: string
    chunkBase64?: string
    mimeType?: string
    timestamp?: number
    speaker?: string
    text?: string
    languageHint?: string
  }, token: string) => {
    const res = await fetch(`${API_URL}/api/stream/chunk`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    })
    return safeJson(res)
  },

  stopStream: async (meetingId: string, token: string) => {
    const res = await fetch(`${API_URL}/api/stream/stop`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ meetingId }),
    })
    return safeJson(res)
  },

  getMeeting: async (meetingId: string, token: string) => {
    const res = await fetch(`${API_URL}/api/stream/${meetingId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
    return safeJson(res)
  },
}