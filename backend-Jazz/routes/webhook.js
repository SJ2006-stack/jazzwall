const router = require('express').Router()
const supabase = require('../lib/supabase')
const { generateSummary } = require('../lib/summarise')

// Live transcript chunks from Vexa
router.post('/transcript', async (req, res) => {
  const { bot_id, speaker, text, timestamp } = req.body

  try {
    // Get meeting_id from bot_id
    const { data: meeting } = await supabase
      .from('meetings')
      .select('id')
      .eq('bot_id', bot_id)
      .single()

    if (!meeting) return res.status(404).json({ error: 'Meeting not found' })

    // Insert transcript line
    // Supabase Realtime automatically pushes this to frontend
    await supabase.from('transcripts').insert({
      meeting_id: meeting.id,
      speaker: speaker || 'Speaker',
      text,
      timestamp: timestamp || Date.now()
    })

    res.json({ success: true })

  } catch (err) {
    console.error('Transcript webhook error:', err)
    res.status(500).json({ error: err.message })
  }
})

// Meeting ended — trigger summary
router.post('/completed', async (req, res) => {
  const { bot_id } = req.body

  try {
    const { data: meeting } = await supabase
      .from('meetings')
      .select('id')
      .eq('bot_id', bot_id)
      .single()

    if (!meeting) return res.status(404).json({ error: 'Meeting not found' })

    // Update status
    await supabase
      .from('meetings')
      .update({ status: 'completed' })
      .eq('bot_id', bot_id)

    // Fetch full transcript
    const { data: lines } = await supabase
      .from('transcripts')
      .select('speaker, text')
      .eq('meeting_id', meeting.id)
      .order('timestamp')

    const fullTranscript = lines
      .map(l => `${l.speaker}: ${l.text}`)
      .join('\n')

    // Run summary async — don't block webhook response
    generateSummary(fullTranscript, meeting.id)

    res.json({ success: true })

  } catch (err) {
    console.error('Completed webhook error:', err)
    res.status(500).json({ error: err.message })
  }
})

module.exports = router