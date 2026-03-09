const { createClient } = require('@supabase/supabase-js')

module.exports = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY  // service key — not anon key
)