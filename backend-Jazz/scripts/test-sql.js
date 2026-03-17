require('dotenv').config()
const supabase = require('../lib/supabase')
async function test() {
  const { data: transcripts, error } = await supabase
    .from('transcripts')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5)
  console.log('Recent 5 transcripts:', transcripts, error)
}
test()
