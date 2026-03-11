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
        recording_mode: "speaker_view",
        webhook_url: `${process.env.BACKEND_URL}/api/webhook/transcript`,

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

router.post('/leave', requireAuth, async (req, res) => {
  const { botId } = req.body
  logger.info('Bot leave requested', { botId })

  try {
    await fetch(`https://api.cloud.vexa.ai/bots/${botId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${process.env.VEXA_API_KEY}` }
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