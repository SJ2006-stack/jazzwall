const router = require('express').Router()
const supabase = require('../lib/supabase')
const { requireAuth } = require('../lib/auth')
const logger = require('../lib/logger')

router.post('/join', requireAuth, async (req, res) => {
  const { meetingUrl, meetingId } = req.body
  const userId = req.userId // from verified Clerk JWT

  logger.info('Bot join requested', { meetingUrl, userId, meetingId })

  if (!meetingUrl) {
    logger.warn('Bot join failed — missing fields', { meetingUrl, userId })
    return res.status(400).json({ error: 'meetingUrl is required' })
  }

  try {
    // Check if a bot is already active for this meeting
    const { data: existingBot } = await supabase
      .from('meetings')
      .select('*')
      .eq('id', meetingId)
      .eq('status', 'active')
      .single()

    if (existingBot) {
      logger.info('Bot already active for meeting', { meetingId })
      return res.status(200).json({
        message: 'Bot already in meeting',
        meetingId
      })
    }

    logger.info('Sending bot to Vexa Cloud', { meetingUrl })

    const vexaRes = await fetch('https://api.cloud.vexa.ai/bots', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': process.env.VEXA_API_KEY
      },
      body: JSON.stringify({
        meeting_url: meetingUrl,
        platform: "google_meet",
        native_meeting_id: meetingUrl.split('/').pop(),
        bot_name: "MeetingMind 🇮🇳",
        entry_message: "Namaste! I'm taking notes for this meeting.",
        recording_mode: "speaker_view"
      })
    })

    if (!vexaRes.ok) {
      const errText = await vexaRes.text()

      // 409 = bot already in this meeting — not an error
      if (vexaRes.status === 409) {
        logger.info('Vexa 409 — bot already active', { meetingUrl })
        return res.status(200).json({
          message: 'Bot already active in this meeting',
          meetingId
        })
      }

      logger.error('Vexa API error', {
        status: vexaRes.status,
        response: errText
      })
      throw new Error(`Vexa returned ${vexaRes.status}: ${errText}`)
    }

    const vexaData = await vexaRes.json()
    logger.info('Vexa bot created', { bot_id: vexaData.bot_id })

    const { data, error } = await supabase
      .from('meetings')
      .insert({
        id: meetingId,
        user_id: userId,
        bot_id: vexaData.bot_id,
        meet_url: meetingUrl,
        status: 'active'
      })
      .select()
      .single()

    if (error) {
      logger.error('Supabase insert failed', { error: error.message })
      throw error
    }

    logger.info('Meeting saved to DB', { meetingId, bot_id: vexaData.bot_id })
    res.json({ success: true, bot_id: vexaData.bot_id, meeting: data })

  } catch (err) {
    logger.error('Bot join error', {
      error: err.message,
      stack: err.stack,
      meetingUrl,
      userId
    })
    res.status(500).json({ error: err.message })
  }
})

/* ── Poll Vexa Cloud for live transcript and sync to Supabase ── */
router.get('/transcript/:meetingId', requireAuth, async (req, res) => {
  const { meetingId } = req.params
  logger.info('Transcript poll requested', { meetingId })

  try {
    // 1. Look up the meeting to get bot_id
    const { data: meeting, error: meetingErr } = await supabase
      .from('meetings')
      .select('bot_id, status, user_id')
      .eq('id', meetingId)
      .eq('user_id', req.userId)
      .single()

    if (meetingErr || !meeting) {
      return res.status(404).json({ error: 'Meeting not found' })
    }

    if (!meeting.bot_id) {
      return res.status(400).json({ error: 'No bot associated with this meeting' })
    }

    // 2. Fetch transcript from Vexa Cloud
    const vexaRes = await fetch(
      `https://api.cloud.vexa.ai/bots/${meeting.bot_id}/transcript`,
      {
        headers: { 'X-API-Key': process.env.VEXA_API_KEY }
      }
    )

    if (!vexaRes.ok) {
      const errText = await vexaRes.text()
      logger.warn('Vexa transcript fetch failed', {
        status: vexaRes.status,
        response: errText,
        botId: meeting.bot_id
      })
      // Return whatever we already have in Supabase
      const { data: existing } = await supabase
        .from('transcripts')
        .select('speaker, text, timestamp')
        .eq('meeting_id', meetingId)
        .order('created_at', { ascending: true })

      return res.json({ transcript: existing ?? [], source: 'cache' })
    }

    const vexaData = await vexaRes.json()
    // Vexa returns an array of transcript entries
    const lines = Array.isArray(vexaData) ? vexaData : (vexaData.transcript ?? vexaData.data ?? [])

    logger.info('Vexa transcript fetched', {
      botId: meeting.bot_id,
      lineCount: lines.length
    })

    // 3. Get existing transcript count for this meeting to avoid re-inserting
    const { count: existingCount } = await supabase
      .from('transcripts')
      .select('*', { count: 'exact', head: true })
      .eq('meeting_id', meetingId)

    const currentCount = existingCount ?? 0

    // 4. Insert only new lines (ones beyond what we already have)
    if (lines.length > currentCount) {
      const newLines = lines.slice(currentCount)
      const rows = newLines.map((line) => ({
        meeting_id: meetingId,
        speaker: line.speaker ?? line.name ?? 'Speaker',
        text: line.text ?? line.content ?? line.transcript ?? '',
        timestamp: line.timestamp ?? line.start_time ?? null
      }))

      if (rows.length > 0) {
        const { error: insertErr } = await supabase
          .from('transcripts')
          .insert(rows)

        if (insertErr) {
          logger.error('Transcript insert failed', { error: insertErr.message })
        } else {
          logger.info('New transcript lines synced', {
            meetingId,
            newLines: rows.length,
            total: lines.length
          })
        }
      }
    }

    // 5. Return full transcript
    const mapped = lines.map((line) => ({
      speaker: line.speaker ?? line.name ?? 'Speaker',
      text: line.text ?? line.content ?? line.transcript ?? '',
      timestamp: line.timestamp ?? line.start_time ?? null
    }))

    res.json({ transcript: mapped, source: 'vexa', total: mapped.length })

  } catch (err) {
    logger.error('Transcript poll error', {
      error: err.message,
      stack: err.stack,
      meetingId
    })
    res.status(500).json({ error: err.message })
  }
})

router.post('/leave', requireAuth, async (req, res) => {
  const { botId } = req.body
  logger.info('Bot leave requested', { botId })

  try {
    await fetch(`https://api.cloud.vexa.ai/bots/${botId}`, {
      method: 'DELETE',
      headers: { 'X-API-Key': process.env.VEXA_API_KEY }
    })

    await supabase
      .from('meetings')
      .update({ status: 'completed' })
      .eq('bot_id', botId)

    logger.info('Bot removed and meeting completed', { botId })
    res.json({ success: true })

  } catch (err) {
    logger.error('Bot leave error', { error: err.message, botId })
    res.status(500).json({ error: err.message })
  }
})

module.exports = router