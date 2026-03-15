const router = require('express').Router()
const supabase = require('../lib/supabase')
const { requireAuth } = require('../lib/auth')
const { generateSummary } = require('../lib/summarise')
const logger = require('../lib/logger')

const meetingSessions = new Map()

const AZURE_LANGUAGE_MAP = {
  hi: 'hi-IN',
  ta: 'ta-IN',
  te: 'te-IN',
  bn: 'bn-IN',
  kn: 'kn-IN',
  mr: 'mr-IN',
}

function detectLanguageFromText(text = '') {
  if (!text || !text.trim()) return 'en'

  const sample = text.trim()

  // Script-based detection first
  if (/[\u0B80-\u0BFF]/.test(sample)) return 'ta'
  if (/[\u0C00-\u0C7F]/.test(sample)) return 'te'
  if (/[\u0980-\u09FF]/.test(sample)) return 'bn'
  if (/[\u0C80-\u0CFF]/.test(sample)) return 'kn'
  if (/[\u0900-\u097F]/.test(sample)) {
    const marathiMarkers = /(आहे|तुम्ही|करणार|झाले|काय)/i
    return marathiMarkers.test(sample) ? 'mr' : 'hi'
  }

  return 'en'
}

function chooseEngine(languageCode) {
  if (['en', 'hinglish'].includes(languageCode)) {
    return { engine: 'deepgram', model: 'nova-3', language: 'multi' }
  }

  if (AZURE_LANGUAGE_MAP[languageCode]) {
    return {
      engine: 'azure',
      model: 'azure-conversation',
      language: AZURE_LANGUAGE_MAP[languageCode],
    }
  }

  return { engine: 'deepgram', model: 'nova-3', language: 'multi' }
}

async function transcribeWithDeepgram(audioBuffer, mimeType = 'audio/webm') {
  const response = await fetch('https://api.deepgram.com/v1/listen?model=nova-3&language=multi&smart_format=true', {
    method: 'POST',
    headers: {
      Authorization: `Token ${process.env.DEEPGRAM_API_KEY}`,
      'Content-Type': mimeType,
    },
    body: audioBuffer,
  })

  if (!response.ok) {
    const errText = await response.text()
    throw new Error(`Deepgram transcription failed: ${response.status} ${errText}`)
  }

  const data = await response.json()
  return data?.results?.channels?.[0]?.alternatives?.[0]?.transcript || ''
}

async function transcribeWithAzure(audioBuffer, languageTag) {
  const region = process.env.AZURE_SPEECH_REGION || 'centralindia'
  const endpoint = `https://${region}.stt.speech.microsoft.com/speech/recognition/conversation/cognitiveservices/v1?language=${encodeURIComponent(languageTag)}`

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Ocp-Apim-Subscription-Key': process.env.AZURE_SPEECH_KEY,
      'Content-Type': 'audio/wav; codecs=audio/pcm; samplerate=16000',
      Accept: 'application/json',
    },
    body: audioBuffer,
  })

  if (!response.ok) {
    const errText = await response.text()
    throw new Error(`Azure transcription failed: ${response.status} ${errText}`)
  }

  const data = await response.json()
  return data?.DisplayText || ''
}

async function transcribeChunk({ engineConfig, audioBuffer, mimeType }) {
  if (!audioBuffer || !audioBuffer.length) return ''

  if (engineConfig.engine === 'azure') {
    return transcribeWithAzure(audioBuffer, engineConfig.language)
  }

  return transcribeWithDeepgram(audioBuffer, mimeType)
}

router.post('/start', async (req, res) => {
  const { meetingId, meetUrl, languageHint, userId } = req.body || {}

  if (!meetingId || !userId) {
    return res.status(400).json({ error: 'meetingId and userId are required' })
  }

  try {
    const engineConfig = chooseEngine(languageHint || 'en')

    const { data, error } = await supabase
      .from('meetings')
      .insert({
        id: meetingId,
        user_id: userId,
        meet_url: meetUrl || '',
        status: 'active',
        language_detected: languageHint || null,
        engine_used: engineConfig.engine,
      })
      .select()
      .single()

    if (error) throw error

    meetingSessions.set(meetingId, {
      userId,
      startedAt: Date.now(),
      sampleText: '',
      languageDetected: languageHint || null,
      engineConfig,
    })

    logger.info('Stream meeting started', {
      meetingId,
      userId,
      languageHint: languageHint || null,
      engine: engineConfig.engine,
    })

    return res.json({ success: true, meetingId, meeting: data })
  } catch (err) {
    logger.error('Stream start failed', {
      error: err.message,
      meetingId,
      userId,
    })
    return res.status(500).json({ error: err.message })
  }
})

router.post('/chunk', async (req, res) => {
  const { meetingId, chunkBase64, mimeType, timestamp, speaker, text, languageHint, userId } = req.body || {}

  if (!meetingId) {
    return res.status(400).json({ error: 'meetingId is required' })
  }

  if (!chunkBase64 && !text) {
    return res.status(400).json({ error: 'Either chunkBase64 or text is required' })
  }

  try {
    const { data: meeting, error: meetingError } = await supabase
      .from('meetings')
      .select('id, user_id, status, language_detected, engine_used')
      .eq('id', meetingId)
      .single()

    if (meetingError || !meeting) {
      return res.status(404).json({ error: 'Meeting not found' })
    }

    if (userId && meeting.user_id !== userId) {
      return res.status(403).json({ error: 'Forbidden' })
    }

    if (meeting.status !== 'active') {
      return res.status(409).json({ error: 'Meeting is not active' })
    }

    const session = meetingSessions.get(meetingId) || {
      userId,
      startedAt: Date.now(),
      sampleText: '',
      languageDetected: meeting.language_detected || null,
      engineConfig: chooseEngine(meeting.language_detected || 'en'),
    }

    let transcriptText = text || ''

    if (!transcriptText && chunkBase64) {
      const audioBuffer = Buffer.from(chunkBase64, 'base64')

      // 10-second language detection window
      if (!session.languageDetected) {
        const elapsedMs = Date.now() - session.startedAt
        if (elapsedMs <= 10_000) {
          const hinted = languageHint || detectLanguageFromText(session.sampleText)
          session.languageDetected = hinted
          session.engineConfig = chooseEngine(hinted)

          await supabase
            .from('meetings')
            .update({
              language_detected: session.languageDetected,
              engine_used: session.engineConfig.engine,
            })
            .eq('id', meetingId)
        }
      }

      transcriptText = await transcribeChunk({
        engineConfig: session.engineConfig,
        audioBuffer,
        mimeType: mimeType || 'audio/webm',
      })
    }

    if (!transcriptText || !transcriptText.trim()) {
      meetingSessions.set(meetingId, session)
      return res.json({ success: true, ignored: true })
    }

    session.sampleText = `${session.sampleText} ${transcriptText}`.trim().slice(0, 4000)
    meetingSessions.set(meetingId, session)

    const transcriptRow = {
      meeting_id: meetingId,
      speaker: speaker || 'Speaker',
      text: transcriptText,
      timestamp: timestamp || Date.now(),
    }

    const { error: insertError } = await supabase
      .from('transcripts')
      .insert(transcriptRow)

    if (insertError) throw insertError

    return res.json({
      success: true,
      transcript: transcriptText,
      languageDetected: session.languageDetected,
      engineUsed: session.engineConfig.engine,
    })
  } catch (err) {
    logger.error('Stream chunk failed', {
      error: err.message,
      meetingId,
      userId,
    })
    return res.status(500).json({ error: err.message })
  }
})

router.post('/stop', async (req, res) => {
  const { meetingId, userId } = req.body || {}

  if (!meetingId) {
    return res.status(400).json({ error: 'meetingId is required' })
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
        engine_used: session?.engineConfig?.engine || null,
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

    // Fire-and-forget summary generation through Groq Llama 3.1 70B utility
    void generateSummary(fullTranscript, meetingId)

    meetingSessions.delete(meetingId)

    return res.json({ success: true, meetingId, status: 'completed' })
  } catch (err) {
    logger.error('Stream stop failed', {
      error: err.message,
      meetingId,
      userId,
    })
    return res.status(500).json({ error: err.message })
  }
})

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
    logger.error('Get stream meeting failed', {
      error: err.message,
      meetingId,
      userId,
    })
    return res.status(500).json({ error: err.message })
  }
})

module.exports = router
