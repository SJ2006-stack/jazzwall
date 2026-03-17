const { Server: SocketIO } = require('socket.io')
const WebSocket = require('ws')
const logger = require('../lib/logger')
const supabase = require('../lib/supabase')

const DEEPGRAM_URL =
  'wss://api.deepgram.com/v1/listen' +
  '?model=nova-3' +
  '&language=multi' +
  '&smart_format=true' +
  '&interim_results=true' +
  '&endpointing=300' +
  '&utterance_end_ms=1000' +
  '&vad_events=true'

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

      dgSocket = new WebSocket(DEEPGRAM_URL, {
        headers: { Authorization: `Token ${process.env.DEEPGRAM_API_KEY}` },
      })

      dgSocket.on('open', () => {
        logger.info('Deepgram WS open', { meetingId })
        socket.emit('ready', { message: 'Streaming Engine ready' })
      })

      dgSocket.on('message', async (rawData) => {
        let msg
        try { msg = JSON.parse(rawData.toString()) } catch { return }

        if (msg.type === 'UtteranceEnd' || msg.type === 'SpeechStarted') return

        const alt = msg?.channel?.alternatives?.[0]
        const transcript = alt?.transcript
        if (!transcript || !transcript.trim()) return

        const isFinal = msg.is_final === true
        const isSpeechFinal = msg.speech_final === true

        // 1. Emit live text -> extension/frontend
        socket.emit('transcript', { text: transcript, isFinal: isFinal || isSpeechFinal, timestamp: Date.now() })

        // 2. Persist transcripts -> database
        if (isFinal || isSpeechFinal) {
          try {
            await supabase.from('transcripts').insert({
              meeting_id: meetingId,
              speaker: 'Speaker',
              text: transcript,
              timestamp: Date.now(),
            })
          } catch (err) {
            logger.error('Transcript Processor error', { error: err.message, meetingId })
          }
        }
      })

      dgSocket.on('error', (err) => {
        logger.error('Deepgram WS error', { error: err.message, meetingId })
        socket.emit('stream-error', { message: 'STT engine error' })
      })

      dgSocket.on('close', () => { dgSocket = null })
    })

    socket.on('audio-chunk', (chunk) => {
      if (dgSocket && dgSocket.readyState === WebSocket.OPEN) {
        dgSocket.send(chunk)
      }
    })

    socket.on('disconnect', () => {
      if (dgSocket && dgSocket.readyState === WebSocket.OPEN) {
        try { 
          dgSocket.send(JSON.stringify({ type: 'CloseStream' }))
          // Wait briefly before actually closing socket to let last messages flow
          setTimeout(() => {
            if (dgSocket) dgSocket.close()
          }, 500)
        } catch {}
      }
    })
  })

  return io
}

module.exports = { initStreamingEngine }
