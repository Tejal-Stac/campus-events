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
  
  console.log("User Role Check (isDean):", req.user.role)
  if (req.user.role?.toLowerCase() !== 'dean') {
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
  
  console.log("User Role Check (isFacultyOrDean):", req.user.role)
  if (!['faculty', 'dean'].includes(req.user.role?.toLowerCase())) {
    return res.status(403).json({ 
      message: 'Access denied. Faculty or Dean role required.',
      userRole: req.user.role 
    })
  }
  
  next()
}

// Club President middleware [NEW]
const isClubPresident = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' })
  }
  
  console.log("User Role Check (isClubPresident):", req.user.role)
  if (req.user.role?.toLowerCase() !== 'club_president') {
    return res.status(403).json({ 
      message: 'Access denied. Club President role required.',
      userRole: req.user.role 
    })
  }
  
  next()
}

// Faculty, Dean, or Club President middleware [NEW]
const isFacultyOrDeanOrClubPresident = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' })
  }
  
  console.log("User Role Check (isFacultyOrDeanOrClubPresident):", req.user.role)
  if (!['faculty', 'dean', 'club_president'].includes(req.user.role?.toLowerCase())) {
    return res.status(403).json({ 
      message: 'Access denied. Faculty, Dean, or Club President role required.',
      userRole: req.user.role 
    })
  }
  
  next()
}

module.exports = auth
module.exports.isDean = isDean
module.exports.isFacultyOrDean = isFacultyOrDean
module.exports.isClubPresident = isClubPresident
module.exports.isFacultyOrDeanOrClubPresident = isFacultyOrDeanOrClubPresident