const router = require('express').Router()
const supabase = require('../lib/supabase')
const { requireAuth } = require('../lib/auth')
const { generateSummary } = require('../lib/summarise')
const logger = require('../lib/logger')

// In-memory map stores minimal session metadata (used by /stop for language info)
// Actual transcription is now handled server-side via the Socket.io → Deepgram bridge in server.js
const meetingSessions = new Map()

const UUID_V4_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

function isValidMeetingId(meetingId) {
  return typeof meetingId === 'string' && UUID_V4_REGEX.test(meetingId)
}

// ─── POST /api/stream/start ───────────────────────────────────────────────────
router.post('/start', async (req, res) => {
  const { meetingId, meetUrl, languageHint, userId } = req.body || {}

  if (!meetingId || !userId) {
    return res.status(400).json({ error: 'meetingId and userId are required' })
  }

  if (!isValidMeetingId(meetingId)) {
    return res.status(400).json({ error: 'meetingId must be a valid UUID' })
  }

  try {
    const { data, error } = await supabase
      .from('meetings')
      .insert({
        id: meetingId,
        user_id: userId,
        meet_url: meetUrl || '',
        status: 'active',
        language_detected: languageHint || null,
        engine_used: 'deepgram',
      })
      .select()
      .single()

    if (error) throw error

    meetingSessions.set(meetingId, {
      userId,
      startedAt: Date.now(),
      languageDetected: languageHint || null,
    })

    logger.info('Stream meeting started', { meetingId, userId, languageHint: languageHint || null })

    return res.json({ success: true, meetingId, meeting: data })
  } catch (err) {
    logger.error('Stream start failed', { error: err.message, meetingId, userId })
    return res.status(500).json({ error: err.message })
  }
})

// ─── POST /api/stream/stop ────────────────────────────────────────────────────
router.post('/stop', async (req, res) => {
  const { meetingId, userId } = req.body || {}

  if (!meetingId) {
    return res.status(400).json({ error: 'meetingId is required' })
  }

  if (!isValidMeetingId(meetingId)) {
    return res.status(400).json({ error: 'meetingId must be a valid UUID' })
  }

  try {
    const { data: meeting, error: meetingError } = await supabase
      .from('meetings')
      .select('id, user_id, status')
      .eq('id', meetingId)
      .single()

    if (meetingError || !meeting) {
      return res.status(404).json({ error: 'Meeting not found' })
    }

    if (userId && meeting.user_id !== userId) {
      return res.status(403).json({ error: 'Forbidden' })
    }

    const session = meetingSessions.get(meetingId)

    const { error: updateError } = await supabase
      .from('meetings')
      .update({
        status: 'completed',
        language_detected: session?.languageDetected || null,
        engine_used: 'deepgram',
      })
      .eq('id', meetingId)

    if (updateError) throw updateError

    const { data: lines, error: transcriptError } = await supabase
      .from('transcripts')
      .select('speaker, text')
      .eq('meeting_id', meetingId)
      .order('timestamp', { ascending: true })

    if (transcriptError) throw transcriptError

    const fullTranscript = (lines || [])
      .map((line) => `${line.speaker || 'Speaker'}: ${line.text}`)
      .join('\n')

    // Fire-and-forget summary generation via Groq Llama 3.1 70B
    void generateSummary(fullTranscript, meetingId)

    meetingSessions.delete(meetingId)

    return res.json({ success: true, meetingId, status: 'completed' })
  } catch (err) {
    logger.error('Stream stop failed', { error: err.message, meetingId, userId })
    return res.status(500).json({ error: err.message })
  }
})

// ─── GET /api/stream/:id ──────────────────────────────────────────────────────
router.get('/:id', requireAuth, async (req, res) => {
  const meetingId = req.params.id
  const userId = req.userId

  try {
    const { data: meeting, error: meetingError } = await supabase
      .from('meetings')
      .select('*')
      .eq('id', meetingId)
      .eq('user_id', userId)
      .single()

    if (meetingError || !meeting) {
      return res.status(404).json({ error: 'Meeting not found' })
    }

    const { data: transcript, error: transcriptError } = await supabase
      .from('transcripts')
      .select('speaker, text, timestamp, created_at')
      .eq('meeting_id', meetingId)
      .order('created_at', { ascending: true })

    if (transcriptError) throw transcriptError

    const { data: summary, error: summaryError } = await supabase
      .from('summaries')
      .select('summary, action_items, key_decisions, follow_ups, created_at')
      .eq('meeting_id', meetingId)
      .single()

    if (summaryError && summaryError.code !== 'PGRST116') {
      throw summaryError
    }

    return res.json({
      success: true,
      meeting,
      transcript: transcript || [],
      summary: summary || null,
    })
  } catch (err) {
    logger.error('Get stream meeting failed', { error: err.message, meetingId, userId })
    return res.status(500).json({ error: err.message })
  }
})

module.exports = router
