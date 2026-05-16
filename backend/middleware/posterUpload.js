/**
 * posterUpload middleware
 * Accepts image files (jpg/png/gif/webp) and presentation files (pdf/ppt/pptx).
 * Files are saved to uploads/posters/ with a timestamped unique name.
 */
const multer = require('multer')
const path   = require('path')
const fs     = require('fs')

const DEST = path.join(__dirname, '..', 'uploads', 'posters')

// Create directory if it doesn't exist
if (!fs.existsSync(DEST)) fs.mkdirSync(DEST, { recursive: true })

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, DEST),
  filename:    (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e6)}`
    cb(null, unique + path.extname(file.originalname).toLowerCase())
  },
})

const ALLOWED_EXT = new Set(['.jpg', '.jpeg', '.png', '.gif', '.webp', '.pdf', '.ppt', '.pptx'])

const fileFilter = (_req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase()
  if (ALLOWED_EXT.has(ext)) cb(null, true)
  else cb(new Error('Only images (jpg/png/gif/webp) and presentations (pdf/ppt/pptx) are allowed'), false)
}

module.exports = multer({
  storage,
  fileFilter,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB max
})
