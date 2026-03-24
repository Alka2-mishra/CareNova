const { verifyToken, createClerkClient } = require('@clerk/backend')

const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY })

const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' })
    }

    const token = authHeader.split(' ')[1]

    // Try verifyToken first (works for JWT templates)
    try {
      const payload = await verifyToken(token, {
        secretKey: process.env.CLERK_SECRET_KEY,
      })
      req.auth = { userId: payload.sub }
      return next()
    } catch (jwtErr) {
      console.log('JWT verify failed, trying session token...', jwtErr.message)
    }

    // Fallback: treat as session token and verify via Clerk API
    try {
      const { userId } = await clerkClient.authenticateRequest(req, {
        secretKey: process.env.CLERK_SECRET_KEY,
      })
      if (!userId) return res.status(401).json({ error: 'Invalid session' })
      req.auth = { userId }
      return next()
    } catch (sessionErr) {
      console.log('Session verify failed:', sessionErr.message)
    }

    return res.status(401).json({ error: 'Invalid token' })
  } catch (err) {
    console.error('Auth middleware error:', err)
    return res.status(401).json({ error: 'Auth failed' })
  }
}

module.exports = { requireAuth }
