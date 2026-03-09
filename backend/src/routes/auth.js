const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { PrismaClient } = require('@prisma/client')
const { requireAuth } = require('../middleware/auth')

const router = express.Router()
const prisma = new PrismaClient()

function makeToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  )
}

function safeUser(user) {
  const { password, ...rest } = user
  return rest
}

// POST /api/auth/login
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body
    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña requeridos' })
    }

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      return res.status(401).json({ error: 'Credenciales incorrectas' })
    }

    const valid = await bcrypt.compare(password, user.password)
    if (!valid) {
      return res.status(401).json({ error: 'Credenciales incorrectas' })
    }

    res.json({ token: makeToken(user), user: safeUser(user) })
  } catch (err) { next(err) }
})

// GET /api/auth/me  — requiere token
router.get('/me', requireAuth, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } })
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' })
    res.json(safeUser(user))
  } catch (err) { next(err) }
})

// POST /api/auth/register  — solo admin puede crear usuarios
// (deshabilitado en prod si quieres — solo para seed/testing)
router.post('/register', async (req, res, next) => {
  try {
    const { nombre, email, password, role } = req.body
    if (!nombre || !email || !password) {
      return res.status(400).json({ error: 'Nombre, email y contraseña requeridos' })
    }

    const exists = await prisma.user.findUnique({ where: { email } })
    if (exists) return res.status(409).json({ error: 'Email ya registrado' })

    const hash = await bcrypt.hash(password, 10)
    const user = await prisma.user.create({
      data: { nombre, email, password: hash, role: role || 'invitado' }
    })

    res.status(201).json({ token: makeToken(user), user: safeUser(user) })
  } catch (err) { next(err) }
})

module.exports = router
