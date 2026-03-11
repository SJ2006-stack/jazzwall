const router = require('express').Router()
const supabase = require('../lib/supabase')
const { generateSummary } = require('../lib/summarise')
const logger = require('../lib/logger')

// Live transcript chunks from Vexa
router.post('/transcript', async (req, res) => {
  const { bot_id, speaker, text, timestamp } = req.body

  logger.debug('Transcript chunk received', { bot_id, speaker, text })

  try {
    const { data: meeting, error: meetingError } = await supabase
      .from('meetings')
      .select('id')
      .eq('bot_id', bot_id)
      .single()

    if (meetingError || !meeting) {
      logger.warn('Meeting not found for bot', { bot_id })
      return res.status(404).json({ error: 'Meeting not found' })
    }

    const { error } = await supabase
      .from('transcripts')
      .insert({
        meeting_id: meeting.id,
        speaker: speaker || 'Speaker',
        text,
        timestamp: timestamp || Date.now()
      })

    if (error) {
      logger.error('Transcript insert failed', { error: error.message })
      throw error
    }

    logger.debug('Transcript saved', { meeting_id: meeting.id })
    res.json({ success: true })

  } catch (err) {
    logger.error('Transcript webhook error', {
      error: err.message,
      bot_id
    })
    res.status(500).json({ error: err.message })
  }
})

// Meeting ended — trigger summary
router.post('/completed', async (req, res) => {
  const { bot_id } = req.body
  logger.info('Meeting completed', { bot_id })

  try {
    const { data: meeting, error: meetingError } = await supabase
      .from('meetings')
      .select('id')
      .eq('bot_id', bot_id)
      .single()

    if (meetingError || !meeting) {
      logger.warn('Meeting not found on completion', { bot_id })
      return res.status(404).json({ error: 'Meeting not found' })
    }

    await supabase
      .from('meetings')
      .update({ status: 'completed' })
      .eq('bot_id', bot_id)

    const { data: lines } = await supabase
      .from('transcripts')
      .select('speaker, text')
      .eq('meeting_id', meeting.id)
      .order('timestamp')

    const fullTranscript = lines
      .map(l => `${l.speaker}: ${l.text}`)
      .join('\n')

    logger.info('Generating summary', {
      meeting_id: meeting.id,
      transcript_lines: lines.length
    })

    // Run summary async — don't block webhook response
    generateSummary(fullTranscript, meeting.id)

    res.json({ success: true })

  } catch (err) {
    logger.error('Completed webhook error', {
      error: err.message,
      bot_id
    })
    res.status(500).json({ error: err.message })
  }
})

module.exports = router