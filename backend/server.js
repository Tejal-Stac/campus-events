const express = require('express')
const cors = require('cors')
require('dotenv').config()

const app = express()

app.use(cors())
app.use(express.json())

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`)
  next()
})

app.use('/api/auth', require('./routes/auth'))
app.use('/api/events', require('./routes/events'))
app.use('/api/users', require('./routes/users'))
app.use('/api/certificates', require('./routes/certificates'))
app.use('/api/import', require('./routes/import'))

app.get('/', (req, res) => {
  res.json({ message: 'Campus Events Backend is running!' })
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log('Server running on port ' + PORT)
})