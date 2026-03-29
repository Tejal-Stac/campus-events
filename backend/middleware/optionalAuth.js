const jwt = require('jsonwebtoken')

// Like auth, but doesn't reject if no token — sets req.user = null for guests
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]
  if (!token) {
    req.user = null
    return next()
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded
    next()
  } catch {
    req.user = null
    next()
  }
}

module.exports = optionalAuth