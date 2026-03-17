require('dotenv').config()
const supabase = require('../lib/supabase')

async function testTranscripts() {
  const { data, error } = await supabase.from('transcripts').insert({
    meeting_id: '123e4567-e89b-12d3-a456-426614174000', // Need a real meeting id or use dummy? Will fail fkey if fkey exists
    speaker: 'Test',
    text: 'Test',
    timestamp: Date.now()
  }).select()
  console.log(data, error)
  process.exit(0)
}
testTranscripts()
