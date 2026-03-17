require('dotenv').config()
const WebSocket = require('ws')

const DEEPGRAM_URL =
  'wss://api.deepgram.com/v1/listen' +
  '?model=nova-3' +
  '&language=multi' +
  '&smart_format=true' +
  '&interim_results=true' +
  '&endpointing=300' +
  '&utterance_end_ms=1000' +
  '&vad_events=true'

const ws = new WebSocket(DEEPGRAM_URL, {
  headers: { Authorization: `Token ${process.env.DEEPGRAM_API_KEY}` },
})

ws.on('open', () => {
  console.log('✅ Connected to Deepgram!')
  ws.close()
})

ws.on('error', (err) => {
  console.error('❌ Failed to connect to Deepgram:')
  console.error(err)
})

ws.on('close', (code, reason) => {
  console.log('WS closed:', code, reason.toString())
})
