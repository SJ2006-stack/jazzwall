const router = require('express').Router()
const supabase = require('../lib/supabase')
const logger = require('../lib/logger')

// In a full implementation per diagram, verify Clerk Auth directly
// For current backwards-compatibility with extension, we verify the meetingToken 
// which acts properly as the proxy for the Clerk Auth Token in the Extension UI.
router.post('/check', async (req, res) => {
  const { token } = req.body

  if (!token) {
    return res.status(400).json({ valid: false, error: 'Token is required' })
  }

  try {
    const { data: record, error } = await supabase
      .from('meeting_tokens')
      .select('user_id, expires_at, used')
      .eq('token', token)
      .single()

    if (error || !record) {
      return res.status(401).json({ valid: false, error: 'Invalid token' })
    }

    if (record.used) {
      return res.status(401).json({ valid: false, error: 'Token already used' })
    }

    if (new Date(record.expires_at) < new Date()) {
      return res.status(401).json({ valid: false, error: 'Token expired' })
    }

    // Mark as used after successful validation per old token flow.
    const { error: updateError } = await supabase
      .from('meeting_tokens')
      .update({ used: true })
      .eq('token', token)

    if (updateError) throw updateError

    logger.info('Access check passed', { userId: record.user_id })
    return res.json({ valid: true, userId: record.user_id })
  } catch (err) {
    logger.error('Access check failed', { error: err.message })
    return res.status(500).json({ valid: false, error: err.message })
  }
})

module.exports = router
