const express = require('express')
const { PrismaClient } = require('@prisma/client')
const { requireAuth, requireRole } = require('../middleware/auth')

const router = express.Router()
const prisma = new PrismaClient()

// GET /api/transportistas  — admin/employee
router.get('/', requireAuth, requireRole('admin', 'employee'), async (_req, res, next) => {
  try {
    const transportistas = await prisma.transportista.findMany({
      include: { user: { select: { nombre: true, email: true, avatar: true } } },
      orderBy: { nombre: 'asc' },
    })
    res.json(transportistas)
  } catch (err) { next(err) }
})

// GET /api/transportistas/:id
router.get('/:id', requireAuth, async (req, res, next) => {
  try {
    const t = await prisma.transportista.findUnique({
      where: { id: req.params.id },
      include: { viajes: { orderBy: { createdAt: 'desc' }, take: 10 } },
    })
    if (!t) return res.status(404).json({ error: 'Transportista no encontrado' })
    res.json(t)
  } catch (err) { next(err) }
})

// POST /api/transportistas  — admin
router.post('/', requireAuth, requireRole('admin'), async (req, res, next) => {
  try {
    const { nombre, vehiculo, placa, color, lat, lng, velocidad, userId } = req.body
    const t = await prisma.transportista.create({
      data: {
        nombre, vehiculo, placa,
        color: color || '#3B82F6',
        lat: parseFloat(lat) || 25.6866,
        lng: parseFloat(lng) || -100.3161,
        velocidad: parseFloat(velocidad) || 45,
        ...(userId && { userId }),
      },
    })
    res.status(201).json(t)
  } catch (err) { next(err) }
})

// PUT /api/transportistas/:id  — admin/employee
router.put('/:id', requireAuth, requireRole('admin', 'employee'), async (req, res, next) => {
  try {
    const { nombre, vehiculo, placa, color, estado, lat, lng, velocidad } = req.body
    const t = await prisma.transportista.update({
      where: { id: req.params.id },
      data: {
        ...(nombre    !== undefined && { nombre }),
        ...(vehiculo  !== undefined && { vehiculo }),
        ...(placa     !== undefined && { placa }),
        ...(color     !== undefined && { color }),
        ...(estado    !== undefined && { estado }),
        ...(lat       !== undefined && { lat: parseFloat(lat) }),
        ...(lng       !== undefined && { lng: parseFloat(lng) }),
        ...(velocidad !== undefined && { velocidad: parseFloat(velocidad) }),
      },
    })
    res.json(t)
  } catch (err) { next(err) }
})

// DELETE /api/transportistas/:id  — solo admin
router.delete('/:id', requireAuth, requireRole('admin'), async (req, res, next) => {
  try {
    await prisma.transportista.delete({ where: { id: req.params.id } })
    res.json({ ok: true })
  } catch (err) { next(err) }
})

module.exports = router
