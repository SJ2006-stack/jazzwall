require('dotenv').config()
const http = require('http')
const express = require('express')
const cors = require('cors')
const morgan = require('morgan')
const logger = require('./lib/logger')
const supabase = require('./lib/supabase')
const { initStreamingEngine } = require('./services/StreamingEngine')

const streamRoutes = require('./routes/stream')
const tokenRoutes = require('./routes/tokens')
const webhookRoutes = require('./routes/webhook')
const accessRoutes = require('./routes/access') // New module added per new arch

const app = express()
const httpServer = http.createServer(app)

// Initialize the WebSocket/Deepgram processing architecture
initStreamingEngine(httpServer)

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
app.use('/api/access', accessRoutes)

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