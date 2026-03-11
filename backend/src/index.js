require('dotenv').config()
const express = require('express')
const cors = require('cors')

const authRoutes          = require('./routes/auth')
const centrosRoutes       = require('./routes/centros')
const transportistasRoutes = require('./routes/transportistas')
const viajesRoutes        = require('./routes/viajes')
const reciclajesRoutes    = require('./routes/reciclajes')

const app = express()

// ── Middleware ────────────────────────────────────────────────────────────────
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'https://tetrapak-logistics.vercel.app',
  ...(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : []),
]

function isAllowed(origin) {
  if (!origin) return true
  if (allowedOrigins.includes(origin)) return true
  // Permite cualquier subdominio de vercel.app (preview deploys)
  if (/^https:\/\/[\w-]+-[\w-]+\.vercel\.app$/.test(origin)) return true
  return false
}

app.use(cors({
  origin: (origin, cb) => {
    if (isAllowed(origin)) return cb(null, true)
    cb(new Error(`CORS bloqueado: ${origin}`))
  },
  credentials: true,
}))
app.use(express.json())

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth',           authRoutes)
app.use('/api/centros',        centrosRoutes)
app.use('/api/transportistas', transportistasRoutes)
app.use('/api/viajes',         viajesRoutes)
app.use('/api/reciclajes',     reciclajesRoutes)

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => res.json({ ok: true, ts: new Date().toISOString() }))

// ── 404 catch-all ─────────────────────────────────────────────────────────────
app.use((_req, res) => res.status(404).json({ error: 'Ruta no encontrada' }))

// ── Error handler ─────────────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error(err)
  res.status(500).json({ error: err.message || 'Error interno del servidor' })
})

// ── Start ─────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`🚀 Backend escuchando en http://localhost:${PORT}`)
})
