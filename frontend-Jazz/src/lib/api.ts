const API_URL = process.env.NEXT_PUBLIC_API_URL

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
    return res.json()
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
    return res.json()
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
    return res.json()
  },

  getMeeting: async (meetingId: string, token: string) => {
    const res = await fetch(`${API_URL}/api/stream/${meetingId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
    return res.json()
  },
}