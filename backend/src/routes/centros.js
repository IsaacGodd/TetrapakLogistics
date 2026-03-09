const express = require('express')
const { PrismaClient } = require('@prisma/client')
const { requireAuth, requireRole } = require('../middleware/auth')

const router = express.Router()
const prisma = new PrismaClient()

// GET /api/centros  — público
router.get('/', async (_req, res, next) => {
  try {
    const centros = await prisma.centro.findMany({
      where: { activo: true },
      include: { stats: true },
      orderBy: { nombre: 'asc' },
    })
    // Aplana stats para que sea compatible con el shape del frontend
    const result = centros.map(c => ({
      id: c.id,
      nombre: c.nombre,
      direccion: c.direccion,
      horario: c.horario,
      telefono: c.telefono,
      lat: c.lat,
      lng: c.lng,
      tetrapak: c.tetrapak,
      movil: c.movil,
      capacidad: c.capacidad,
      dias: c.dias,
      materiales: c.materiales,
      stats: c.stats
        ? { toneladas: c.stats.toneladas, viajes: c.stats.viajes, eficiencia: c.stats.eficiencia, conductores: c.stats.conductores, costos: c.stats.costos }
        : { toneladas: 0, viajes: 0, eficiencia: 0, conductores: 0, costos: 0 },
    }))
    res.json(result)
  } catch (err) { next(err) }
})

// GET /api/centros/:id
router.get('/:id', async (req, res, next) => {
  try {
    const centro = await prisma.centro.findUnique({
      where: { id: req.params.id },
      include: { stats: true },
    })
    if (!centro) return res.status(404).json({ error: 'Centro no encontrado' })
    res.json(centro)
  } catch (err) { next(err) }
})

// POST /api/centros  — admin/employee
router.post('/', requireAuth, requireRole('admin', 'employee'), async (req, res, next) => {
  try {
    const { nombre, direccion, horario, telefono, lat, lng, tetrapak, movil, capacidad, dias, materiales } = req.body
    const centro = await prisma.centro.create({
      data: {
        nombre, direccion, horario,
        telefono: telefono || null,
        lat: parseFloat(lat),
        lng: parseFloat(lng),
        tetrapak: Boolean(tetrapak),
        movil: Boolean(movil),
        capacidad: parseFloat(capacidad) || 0,
        dias: dias || [],
        materiales: materiales || [],
        stats: { create: {} }, // crea stats vacías automáticamente
      },
      include: { stats: true },
    })
    res.status(201).json(centro)
  } catch (err) { next(err) }
})

// PUT /api/centros/:id  — admin/employee
router.put('/:id', requireAuth, requireRole('admin', 'employee'), async (req, res, next) => {
  try {
    const { nombre, direccion, horario, telefono, lat, lng, tetrapak, movil, capacidad, dias, materiales } = req.body
    const centro = await prisma.centro.update({
      where: { id: req.params.id },
      data: {
        ...(nombre      !== undefined && { nombre }),
        ...(direccion   !== undefined && { direccion }),
        ...(horario     !== undefined && { horario }),
        ...(telefono    !== undefined && { telefono }),
        ...(lat         !== undefined && { lat: parseFloat(lat) }),
        ...(lng         !== undefined && { lng: parseFloat(lng) }),
        ...(tetrapak    !== undefined && { tetrapak: Boolean(tetrapak) }),
        ...(movil       !== undefined && { movil: Boolean(movil) }),
        ...(capacidad   !== undefined && { capacidad: parseFloat(capacidad) }),
        ...(dias        !== undefined && { dias }),
        ...(materiales  !== undefined && { materiales }),
      },
      include: { stats: true },
    })
    res.json(centro)
  } catch (err) { next(err) }
})

// DELETE /api/centros/:id  — solo admin (soft delete)
router.delete('/:id', requireAuth, requireRole('admin'), async (req, res, next) => {
  try {
    await prisma.centro.update({
      where: { id: req.params.id },
      data: { activo: false },
    })
    res.json({ ok: true })
  } catch (err) { next(err) }
})

module.exports = router
