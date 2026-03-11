require('dotenv').config()
const express = require('express')
const cors = require('cors')
const morgan = require('morgan')
const logger = require('./lib/logger')

const botRoutes = require('./routes/bot')
const webhookRoutes = require('./routes/webhook')

const app = express()

app.use(cors())
app.use(express.json())

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

app.use('/api/bot', botRoutes)
app.use('/api/webhook', webhookRoutes)

// Health check with full system status
app.get('/health', async (req, res) => {
  const supabase = require('./lib/supabase')

  // Check Supabase connection
  const { error: dbError } = await supabase
    .from('meetings')
    .select('count')
    .limit(1)

  const status = {
    status: 'ok',
    ts: Date.now(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    env: {
      supabase: !!process.env.SUPABASE_URL,
      groq: !!process.env.GROQ_API_KEY,
      deepgram: !!process.env.DEEPGRAM_API_KEY,
      azure: !!process.env.AZURE_SPEECH_KEY,
      vexa: !!process.env.VEXA_URL,
      clerk: !!process.env.CLERK_SECRET_KEY,
    },
    database: dbError ? 'error' : 'connected'
  }

  logger.info('Health check', status)
  res.json(status)
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
app.listen(PORT, () => {
  logger.info('Backend started', { port: PORT, env: process.env.NODE_ENV })
})