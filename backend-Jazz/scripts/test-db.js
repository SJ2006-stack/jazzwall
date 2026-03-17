require('dotenv').config()
const supabase = require('../lib/supabase')
const crypto = require('crypto')

async function testDb() {
  console.log('Testing Supabase Connection...')

  // 1. Test Select (Read)
  console.log('\n1. Verifying Read access (checking "meetings" table)...')
  const { data: meetings, error: fetchError } = await supabase
    .from('meetings')
    .select('id')
    .limit(1)
  
  if (fetchError) {
    console.error('❌ Connection or Select failed:', fetchError.message)
    process.exit(1)
  }
  console.log('✅ Connection successful. The "meetings" table is accessible.')

  // 2. Test Insert (Generate a dummy meeting token)
  console.log('\n2. Testing Insert into "meeting_tokens"...')
  const dummyToken = 'test_token_' + crypto.randomBytes(4).toString('hex')
  const { data: insertData, error: insertError } = await supabase
    .from('meeting_tokens')
    .insert({
      user_id: 'test-db-user-id',
      token: dummyToken,
      expires_at: new Date(Date.now() + 60000).toISOString(),
      used: false
    })
    .select()
  
  if (insertError) {
    console.error('❌ Insert failed:', insertError.message)
    process.exit(1)
  }
  console.log('✅ Insert successful! Created record:', insertData[0])

  // 3. Test Delete (Clean up the dummy token)
  console.log('\n3. Testing Delete (cleaning up dummy record)...')
  const { error: deleteError } = await supabase
    .from('meeting_tokens')
    .delete()
    .eq('token', dummyToken)
  
  if (deleteError) {
    console.error('❌ Cleanup failed:', deleteError.message)
  } else {
    console.log('✅ Delete successful. Dummy record removed.')
  }

  console.log('\n🎉 ALL DATABASE TESTS PASSED!')
  process.exit(0)
}

testDb()
