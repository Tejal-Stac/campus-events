const jwt = require('jsonwebtoken')
require('dotenv').config()

// Basic authentication middleware
const auth = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '')

  if (!token) {
    return res.status(401).json({ message: 'No token, access denied' })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded
    next()
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' })
  }
}

// Dean-only middleware
const isDean = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' })
  }
  
  if (req.user.role !== 'dean') {
    return res.status(403).json({ 
      message: 'Access denied. Dean role required.',
      userRole: req.user.role 
    })
  }
  
  next()
}

// Faculty or Dean middleware
const isFacultyOrDean = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' })
  }
  
  if (!['faculty', 'dean'].includes(req.user.role)) {
    return res.status(403).json({ 
      message: 'Access denied. Faculty or Dean role required.',
      userRole: req.user.role 
    })
  }
  
  next()
}

module.exports = auth
module.exports.isDean = isDean
module.exports.isFacultyOrDean = isFacultyOrDean