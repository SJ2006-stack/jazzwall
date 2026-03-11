const { verifyToken } = require('@clerk/backend')

/**
 * Express middleware that verifies a Clerk JWT from the Authorization header.
 * On success, attaches `req.userId` (the Clerk user ID, e.g. "user_2x…").
 */
exports.verifyClerkToken = async (req, res, next) => {
  const authHeader = req.headers.authorization
  const token = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null

  if (!token) {
    return res.status(401).json({ error: 'Missing authorization token' })
  }

  try {
    const payload = await verifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY,
    })
    req.userId = payload.sub // Clerk user ID
    next()
  } catch (err) {
    console.error('Clerk token verification failed:', err.message)
    res.status(401).json({ error: 'Unauthorized' })
  }
}
