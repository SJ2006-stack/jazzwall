require('dotenv').config()
const express = require('express')
const cors = require('cors')

const botRoutes = require('./routes/bot')
const webhookRoutes = require('./routes/webhook')

const app = express()
app.use(cors())
app.use(express.json())

app.use('/api/bot', botRoutes)
app.use('/api/webhook', webhookRoutes)
app.get('/health', (_, res) => res.json({ status: 'ok', ts: Date.now() }))

const PORT = process.env.PORT || 8080
app.listen(PORT, () => console.log(`Backend running on ${PORT}`))