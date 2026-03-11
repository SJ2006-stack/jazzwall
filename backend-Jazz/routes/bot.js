const router = require('express').Router()
const supabase = require('../lib/supabase')
const { verifyClerkToken } = require('../lib/auth')
const logger = require('../lib/logger')

router.post('/join', verifyClerkToken, async (req, res) => {
  const { meetingUrl, meetingId } = req.body
  const userId = req.userId // from verified Clerk JWT

  logger.info('Bot join requested', { meetingUrl, userId, meetingId })

  if (!meetingUrl) {
    logger.warn('Bot join failed — missing fields', { meetingUrl, userId })
    return res.status(400).json({ error: 'meetingUrl is required' })
  }

  try {
    logger.info('Sending bot to Vexa', { meetingUrl })

    const vexaRes = await fetch(`${process.env.VEXA_URL}/bots`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.VEXA_TOKEN}`
      },
      body: JSON.stringify({
        meeting_url: meetingUrl,
        bot_name: "MeetingMind 🇮🇳",
        entry_message: "Namaste! I'm taking notes for this meeting.",
        recording_mode: "speaker_view"
      })
    })

    if (!vexaRes.ok) {
      const errText = await vexaRes.text()
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

router.post('/leave', verifyClerkToken, async (req, res) => {
  const { botId } = req.body
  logger.info('Bot leave requested', { botId })

  try {
    await fetch(`${process.env.VEXA_URL}/bots/${botId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${process.env.VEXA_TOKEN}` }
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