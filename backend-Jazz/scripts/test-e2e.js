require('dotenv').config();
const supabase = require('../lib/supabase');
const { generateSummary } = require('../lib/summarise');
const crypto = require('crypto');

async function testE2E() {
  console.log('--- Starting E2E Data Simulation ---');
  const userId = 'test-e2e-user';
  const meetingId = crypto.randomUUID();

  // 1. Create Meeting
  console.log('\n1. Creating Meeting...');
  const { error: meetError } = await supabase.from('meetings').insert({
    id: meetingId,
    user_id: userId,
    status: 'completed',
    meet_url: 'https://meet.google.com/test-e2e'
  });
  if (meetError) throw new Error(meetError.message);
  console.log('✅ Meeting created:', meetingId);

  // 2. Insert Transcript
  console.log('\n2. Inserting Transcript...');
  const { error: transError } = await supabase.from('transcripts').insert({
    meeting_id: meetingId,
    speaker: 'Test Speaker',
    text: 'Hello, this is a simulated test meeting to verify the end to end flow is working beautifully.',
    timestamp: Date.now()
  });
  if (transError) throw new Error(transError.message);
  console.log('✅ Transcript inserted');

  // 3. Generate Summary
  console.log('\n3. Requesting Summary from Groq...');
  const transcriptText = 'Test Speaker: Hello, this is a simulated test meeting to verify the end to end flow is working beautifully. We need to follow up on the dashboard updates.';
  await generateSummary(transcriptText, meetingId);

  // 4. Verify Summary in DB
  console.log('\n4. Verifying Summary in DB (waiting 3 seconds)...');
  await new Promise(r => setTimeout(r, 3000)); // wait for groq

  const { data: summaryData, error: sumError } = await supabase.from('summaries').select('*').eq('meeting_id', meetingId).single();
  if (sumError && sumError.code !== 'PGRST116') throw new Error(sumError.message);
  
  if (summaryData) {
    console.log('✅ Summary successfully generated and saved!');
    console.log(summaryData);
  } else {
    console.log('❌ Summary not found in DB!');
  }

  // Cleanup
  await supabase.from('meetings').delete().eq('id', meetingId);
  console.log('\n✅ Cleanup complete.');
  process.exit(0);
}

testE2E().catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});
