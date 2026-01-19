import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

// Load .env BEFORE importing handlers (they need env vars)
dotenv.config()

import { chatHandler } from './api/chat'
import { extractProcessDataHandler } from './api/extract-process-data'
import { generatePdfHandler } from './api/generate-pdf'
import { sendEmailHandler } from './api/send-email'
import { sendAssessmentEmailHandler } from './api/send-assessment-email'
import { sendAbandonAlertHandler } from './api/send-abandon-alert'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

// API Routes
app.post('/api/chat', chatHandler)
app.post('/api/extract-process-data', extractProcessDataHandler)
app.post('/api/generate-pdf', generatePdfHandler)
app.post('/api/send-email', sendEmailHandler)
app.post('/api/send-assessment-email', sendAssessmentEmailHandler)
app.post('/api/send-abandon-alert', sendAbandonAlertHandler)

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' })
})

// Serve static files from Vite build
const distPath = path.join(__dirname, '..', 'dist')
app.use(express.static(distPath))

// SPA fallback - serve index.html for all non-API routes
app.get('*', (_req, res) => {
  res.sendFile(path.join(distPath, 'index.html'))
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
