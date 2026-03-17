const supabase = require('./supabase')
const logger = require('./logger')

exports.generateSummary = async (transcript, meetingId) => {
  logger.info('Summary generation started', { meetingId })

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        max_tokens: 1000,
        messages: [{
          role: 'user',
          content: `You are an AI notetaker for Indian professionals.
The transcript may contain Hindi, English, or Hinglish.
Respond ONLY in this exact JSON format, nothing else:

{
  "summary": "3-4 sentence overview in English",
  "action_items": ["item 1 with owner if mentioned", "item 2"],
  "key_decisions": ["decision 1", "decision 2"],
  "follow_ups": ["follow up 1", "follow up 2"]
}

Transcript:
${transcript.slice(0, 8000)}`
        }]
      })
    })

    if (!response.ok) {
      const errText = await response.text()
      logger.error('Groq API error', {
        status: response.status,
        response: errText
      })
      throw new Error(`Groq returned ${response.status}`)
    }

    const data = await response.json()
    const raw = data.choices[0].message.content
    const parsed = JSON.parse(raw.replace(/```json|```/g, '').trim())

    const { error } = await supabase.from('summaries').insert({
      meeting_id: meetingId,
      summary: parsed.summary,
      action_items: parsed.action_items,
      key_decisions: parsed.key_decisions,
      follow_ups: parsed.follow_ups
    })

    if (error) {
      logger.error('Summary save failed', { error: error.message })
      throw error
    }

    logger.info('Summary generated and saved', { meetingId })

  } catch (err) {
    logger.error('Summary generation failed', {
      error: err.message,
      stack: err.stack,
      meetingId
    })
  }
}