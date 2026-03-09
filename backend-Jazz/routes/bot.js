const router = require('express').Router()
const supabase = require('../lib/supabase')

router.post('/join', async (req, res) => {
  const { meetingUrl, userId, meetingId } = req.body

  if (!meetingUrl || !userId) {
    return res.status(400).json({ error: 'meetingUrl and userId required' })
  }

  try {
    // Send bot to meeting via Vexa Lite
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

    const { bot_id } = await vexaRes.json()

    // Save meeting to Supabase
    const { data, error } = await supabase
      .from('meetings')
      .insert({
        id: meetingId,
        user_id: userId,
        bot_id,
        meet_url: meetingUrl,
        status: 'active'
      })
      .select()
      .single()

    if (error) throw error

    res.json({ success: true, bot_id, meeting: data })

  } catch (err) {
    console.error('Bot join error:', err)
    res.status(500).json({ error: err.message })
  }
})

router.post('/leave', async (req, res) => {
  const { botId } = req.body
  
  await fetch(`${process.env.VEXA_URL}/bots/${botId}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${process.env.VEXA_TOKEN}` }
  })

  await supabase
    .from('meetings')
    .update({ status: 'completed' })
    .eq('bot_id', botId)

  res.json({ success: true })
})

module.exports = router