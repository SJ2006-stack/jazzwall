const router = require('express').Router()
const crypto = require('crypto')
const { requireAuth } = require('../lib/auth')
const supabase = require('../lib/supabase')
const logger = require('../lib/logger')

// Generate 5-minute meeting token for extension use
router.post('/generate', requireAuth, async (req, res) => {
  try {
    const token = crypto.randomBytes(16).toString('hex')
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString()

    await supabase
      .from('meeting_tokens')
      .delete()
      .eq('user_id', req.userId)
      .eq('used', false)

    const { data, error } = await supabase
      .from('meeting_tokens')
      .insert({
        user_id: req.userId,
        token,
        expires_at: expiresAt,
        used: false,
      })
      .select('token, expires_at')
      .single()

    if (error) throw error

    logger.info('Meeting token generated', { userId: req.userId })
    return res.json({
      token: data.token,
      expiresAt: data.expires_at,
    })
  } catch (err) {
    logger.error('Token generation error', { error: err.message })
    return res.status(500).json({ error: err.message })
  }
})

module.exports = router
