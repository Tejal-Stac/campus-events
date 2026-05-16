const express = require('express')
const cors = require('cors')
require('dotenv').config()
const auth = require('./middleware/auth')
const { verifyStudentRegistration } = require('./controllers/eventController')

const path = require('path')

const app = express()

app.use(cors())
app.use(express.json())
// Serve uploaded files (event posters, PPTs, etc.)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`)
  next()
})

// API routes
app.use('/api/auth', require('./routes/auth'))
app.use('/api/events', require('./routes/events'))
app.patch('/api/registrations/:registrationId/verify', auth, verifyStudentRegistration)
app.use('/api/users', require('./routes/users'))
app.use('/api/certificates', require('./routes/certificates'))
app.use('/api/import', require('./routes/import'))
app.use('/api/hod', require('./routes/hod'))
app.use('/api/dean', require('./routes/dean'))

app.get('/', (req, res) => {
  res.json({ message: 'Campus Events Backend is running!' })
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log('Server running on port ' + PORT)
})