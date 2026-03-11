const { createClerkClient } = require('@clerk/backend')
const logger = require('./logger')

const clerk = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY
})

exports.requireAuth = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]

  if (!token) {
    logger.warn('No auth token', { path: req.path })
    return res.status(401).json({ error: 'Unauthorized' })
  }

  try {
    const payload = await clerk.verifyToken(token)
    req.userId = payload.sub
    logger.debug('Auth verified', { userId: payload.sub })
    next()
  } catch (err) {
    logger.warn('Auth failed', { error: err.message })
    res.status(401).json({ error: 'Unauthorized' })
  }
}
```

