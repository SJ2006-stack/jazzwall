const API_URL = process.env.NEXT_PUBLIC_API_URL

export const api = {
  // Join a meeting
  joinMeeting: async (meetingUrl: string, userId: string, meetingId: string) => {
    const res = await fetch(`${API_URL}/api/bot/join`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${await getClerkToken()}`
      },
      body: JSON.stringify({ meetingUrl, userId, meetingId })
    })
    return res.json()
  },

  // Leave a meeting
  leaveMeeting: async (botId: string) => {
    const res = await fetch(`${API_URL}/api/bot/leave`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${await getClerkToken()}`
      },
      body: JSON.stringify({ botId })
    })
    return res.json()
  }
}

// Get Clerk token for backend auth
async function getClerkToken() {
  const { getToken } = await import('@clerk/nextjs')
  return getToken()
}