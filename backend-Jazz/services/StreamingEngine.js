const { Server: SocketIO } = require('socket.io')
const { createClient, LiveTranscriptionEvents } = require('@deepgram/sdk')
const logger = require('../lib/logger')
const supabase = require('../lib/supabase')

const deepgram = createClient(process.env.DEEPGRAM_API_KEY)

function initStreamingEngine(httpServer) {
  const io = new SocketIO(httpServer, {
    cors: { origin: process.env.FRONTEND_URL || '*', credentials: true },
    maxHttpBufferSize: 4 * 1024 * 1024,
  })

  io.on('connection', (socket) => {
    logger.info('Socket.io client connected', { socketId: socket.id })

    let dgSocket = null
    let meetingId = null
    let userId = null

    socket.on('join', async ({ meetingId: mid, userId: uid } = {}) => {
      if (!mid || !uid) {
        socket.emit('stream-error', { message: 'join requires meetingId and userId' })
        return
      }
      meetingId = mid
      userId = uid

      // Verify active session
      const { data: meeting, error } = await supabase
        .from('meetings')
        .select('id, user_id, status')
        .eq('id', mid)
        .single()

      if (error || !meeting || meeting.user_id !== uid || meeting.status !== 'active') {
        socket.emit('stream-error', { message: 'Invalid or inactive session' })
        socket.disconnect(true)
        return
      }

      logger.info('Socket joined meeting', { socketId: socket.id, meetingId })

      dgSocket = deepgram.listen.live({
        model: 'nova-2',
        punctuate: true,
        smart_format: true,
        interim_results: true,
        diarize: true,
        endpointing: 300,
        utterance_end_ms: 1000,
        vad_events: true
      })

      dgSocket.on(LiveTranscriptionEvents.Open, () => {
        logger.info('Deepgram SDK live open', { meetingId })
        socket.emit('ready', { message: 'Streaming Engine ready' })
      })

      dgSocket.on(LiveTranscriptionEvents.Transcript, async (data) => {
        if (data.type === 'UtteranceEnd' || data.type === 'SpeechStarted') return

        const alt = data.channel?.alternatives?.[0]
        const text = alt?.transcript
        if (!text) return

        // Extract speaker from words (diarization)
        const speakerId = alt.words?.[0]?.speaker ?? null;
        const speakerName = speakerId !== null ? `Speaker ${speakerId + 1}` : 'Speaker';

        const isFinal = data.is_final === true
        const isSpeechFinal = data.speech_final === true

        // 1. Emit live text -> extension/frontend
        socket.emit('transcript', { 
          text: text, 
          speaker: speakerName,
          isFinal: isFinal || isSpeechFinal, 
          timestamp: Date.now() 
        })

        // 2. Persist transcripts -> database
        if (isFinal || isSpeechFinal) {
          try {
            await supabase.from('transcripts').insert({
              meeting_id: meetingId,
              speaker: speakerName,
              text: text,
              timestamp: Date.now(),
            })
          } catch (err) {
            logger.error('Transcript Processor error', { error: err.message, meetingId })
          }
        }
      })

      dgSocket.on(LiveTranscriptionEvents.Error, (err) => {
        logger.error('Deepgram SDK error', { error: err.message, meetingId })
        socket.emit('stream-error', { message: 'STT engine error' })
      })

      dgSocket.on(LiveTranscriptionEvents.Close, () => { dgSocket = null })
    })

    socket.on('audio-chunk', (chunk) => {
      if (dgSocket && dgSocket.getReadyState() === 1) { // 1 = OPEN
        dgSocket.send(chunk)
      }
    })

    socket.on('disconnect', () => {
      if (dgSocket && dgSocket.getReadyState() === 1) {
        try { 
          // Deepgram SDK handles graceful close
          setTimeout(() => {
            if (dgSocket) dgSocket.finish()
          }, 500)
        } catch {}
      }
    })
  })

  return io
}

module.exports = { initStreamingEngine }
