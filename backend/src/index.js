require('dotenv').config()
const express = require('express')
const cors = require('cors')

const authRoutes          = require('./routes/auth')
const centrosRoutes       = require('./routes/centros')
const transportistasRoutes = require('./routes/transportistas')
const viajesRoutes        = require('./routes/viajes')

const app = express()

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}))
app.use(express.json())

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth',           authRoutes)
app.use('/api/centros',        centrosRoutes)
app.use('/api/transportistas', transportistasRoutes)
app.use('/api/viajes',         viajesRoutes)

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
