require('dotenv').config()
const http = require('http')
const express = require('express')
const cors = require('cors')
const morgan = require('morgan')
const { Server: SocketIO } = require('socket.io')
const WebSocket = require('ws')
const logger = require('./lib/logger')
const supabase = require('./lib/supabase')

const streamRoutes = require('./routes/stream')
const tokenRoutes = require('./routes/tokens')
const webhookRoutes = require('./routes/webhook')

const app = express()
const httpServer = http.createServer(app)

// ─── Socket.io server ────────────────────────────────────────────────────────
const io = new SocketIO(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || '*',
    credentials: true,
  },
  maxHttpBufferSize: 4 * 1024 * 1024, // 4 MB per message
})

// ─── Deepgram Live WebSocket bridge ──────────────────────────────────────────
const DEEPGRAM_URL =
  'wss://api.deepgram.com/v1/listen' +
  '?model=nova-3' +
  '&language=multi' +
  '&smart_format=true' +
  '&interim_results=true' +
  '&utterance_end_ms=1500' +
  '&vad_events=true'

io.on('connection', (socket) => {
  logger.info('Socket.io client connected', { socketId: socket.id })

  let dgSocket = null          // Deepgram WebSocket
  let meetingId = null
  let userId = null

  // ── join: client sends { meetingId, userId } after connecting ──────────────
  socket.on('join', async ({ meetingId: mid, userId: uid } = {}) => {
    if (!mid || !uid) {
      socket.emit('stream-error', { message: 'join requires meetingId and userId' })
      return
    }
    meetingId = mid
    userId = uid

    // Verify meeting exists and is active
    const { data: meeting, error } = await supabase
      .from('meetings')
      .select('id, user_id, status, language_detected')
      .eq('id', mid)
      .single()

    if (error || !meeting) {
      socket.emit('stream-error', { message: 'Meeting not found' })
      socket.disconnect(true)
      return
    }
    if (meeting.user_id !== uid) {
      socket.emit('stream-error', { message: 'Forbidden' })
      socket.disconnect(true)
      return
    }
    if (meeting.status !== 'active') {
      socket.emit('stream-error', { message: 'Meeting is not active' })
      socket.disconnect(true)
      return
    }

    logger.info('Socket joined meeting', { socketId: socket.id, meetingId, userId })

    // Open Deepgram Live connection
    dgSocket = new WebSocket(DEEPGRAM_URL, {
      headers: {
        Authorization: `Token ${process.env.DEEPGRAM_API_KEY}`,
      },
    })

    dgSocket.on('open', () => {
      logger.info('Deepgram WS open', { meetingId })
      socket.emit('ready', { message: 'Deepgram connection open — send audio chunks now' })
    })

    dgSocket.on('message', async (rawData) => {
      let msg
      try {
        msg = JSON.parse(rawData.toString())
      } catch {
        return
      }

      // Handle UtteranceEnd / VAD events (no transcript to process)
      if (msg.type === 'UtteranceEnd' || msg.type === 'SpeechStarted') return

      const alt = msg?.channel?.alternatives?.[0]
      const transcript = alt?.transcript
      if (!transcript || !transcript.trim()) return

      const isFinal = msg.is_final === true

      // Always emit to client (both interim and final)
      socket.emit('transcript', {
        text: transcript,
        isFinal,
        timestamp: Date.now(),
      })

      // Only persist final transcripts
      if (isFinal) {
        try {
          const { error: insertError } = await supabase
            .from('transcripts')
            .insert({
              meeting_id: meetingId,
              speaker: 'Speaker',
              text: transcript,
              timestamp: Date.now(),
            })
          if (insertError) {
            logger.error('Transcript insert failed', { error: insertError.message, meetingId })
          }
        } catch (err) {
          logger.error('Transcript insert threw', { error: err.message, meetingId })
        }
      }
    })

    dgSocket.on('error', (err) => {
      logger.error('Deepgram WS error', { error: err.message, meetingId })
      socket.emit('stream-error', { message: 'Deepgram connection error', detail: err.message })
    })

    dgSocket.on('close', (code, reason) => {
      logger.info('Deepgram WS closed', { code, reason: reason.toString(), meetingId })
      dgSocket = null
    })
  })

  // ── audio-chunk: raw binary from MediaRecorder ─────────────────────────────
  socket.on('audio-chunk', (chunk) => {
    if (!dgSocket || dgSocket.readyState !== WebSocket.OPEN) return
    // chunk arrives as Buffer (Node) or ArrayBuffer (browser); send as-is
    dgSocket.send(chunk)
  })

  // ── disconnect ─────────────────────────────────────────────────────────────
  socket.on('disconnect', (reason) => {
    logger.info('Socket.io client disconnected', { socketId: socket.id, reason, meetingId })
    if (dgSocket) {
      try { dgSocket.close() } catch {}
      dgSocket = null
    }
  })
})

app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true,
}))
app.use(express.json({ limit: '10mb' }))

// Log every request
app.use(morgan('combined', {
  stream: {
    write: (message) => logger.info(message.trim(), { type: 'http' })
  }
}))

// Log request body for debugging
app.use((req, res, next) => {
  if (req.method === 'POST') {
    logger.debug('Incoming request body', {
      path: req.path,
      body: req.body
    })
  }
  next()
})

app.use('/api/stream', streamRoutes)
app.use('/api/tokens', tokenRoutes)
app.use('/api/webhook', webhookRoutes)

// Health check with full system status
app.get('/health', async (req, res) => {
  const supabase = require('./lib/supabase')

  const checks = {
    status: 'ok',
    ts: Date.now(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    env: {
      supabase: !!process.env.SUPABASE_URL,
      groq: !!process.env.GROQ_API_KEY,
      deepgram: !!process.env.DEEPGRAM_API_KEY,
      azure: !!process.env.AZURE_SPEECH_KEY,
      clerk: !!process.env.CLERK_SECRET_KEY,
    },
    database: 'unknown',
    groq_reachable: false,
    version: process.env.npm_package_version || '1.0.0',
  }

  // Check Supabase
  try {
    const { error } = await supabase
      .from('meetings')
      .select('count')
      .limit(1)

    checks.database = error ? 'error' : 'connected'
  } catch {
    checks.database = 'error'
  }

  // Check Groq reachability
  if (checks.env.groq) {
    try {
      const groqRes = await fetch('https://api.groq.com/openai/v1/models', {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        },
      })
      checks.groq_reachable = groqRes.ok
    } catch {
      checks.groq_reachable = false
    }
  }

  const isHealthy =
    checks.database === 'connected' &&
    checks.env.supabase &&
    checks.env.clerk

  checks.status = isHealthy ? 'ok' : 'degraded'

  logger.info('Health check', checks)
  res.status(isHealthy ? 200 : 503).json(checks)
})

// Global error handler
app.use((err, req, res, next) => {
  logger.error('Unhandled error', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    body: req.body
  })
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  })
})

const PORT = process.env.PORT || 8080
httpServer.listen(PORT, () => {
  logger.info('Backend started', { port: PORT, env: process.env.NODE_ENV })
})