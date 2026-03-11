const { Router } = require('express')
const { PrismaClient } = require('@prisma/client')
const { requireAuth, requireRole } = require('../middleware/auth')

const router = Router()
const prisma = new PrismaClient()

function calcImpacto(kg) {
  return {
    envases: Math.round(kg / 0.027),
    agua:    +(kg * 2.5).toFixed(1),
    co2:     +(kg * 1.1).toFixed(2),
  }
}

function genCodigo() {
  return String(Math.floor(100000 + Math.random() * 900000))
}

// POST /api/reciclajes — registrar (queda pendiente)
router.post('/', async (req, res, next) => {
  try {
    const { nombre, deviceId, centroNombre } = req.body
    if (!nombre?.trim() || !deviceId?.trim() || !centroNombre?.trim()) {
      return res.status(400).json({ error: 'nombre, deviceId y centroNombre son requeridos' })
    }
    const kg = +(0.3 + Math.random() * 1.2).toFixed(2)
    const reciclaje = await prisma.reciclaje.create({
      data: { nombre: nombre.trim(), deviceId: deviceId.trim(), centroNombre: centroNombre.trim(), kg, estado: 'pendiente' },
    })
    res.status(201).json({ reciclaje, impacto: calcImpacto(kg) })
  } catch (err) {
    next(err)
  }
})

// GET /api/reciclajes/leaderboard — top 20 aprobados por kg total
router.get('/leaderboard', async (_req, res, next) => {
  try {
    const rows = await prisma.reciclaje.groupBy({
      by: ['nombre'],
      where: { estado: 'aprobado' },
      _sum: { kg: true },
      _count: { id: true },
      orderBy: { _sum: { kg: 'desc' } },
      take: 20,
    })
    const result = await Promise.all(rows.map(async (r) => {
      const last = await prisma.reciclaje.findFirst({
        where: { nombre: r.nombre, estado: 'aprobado' },
        orderBy: { fecha: 'desc' },
        select: { centroNombre: true, fecha: true },
      })
      return {
        nombre: r.nombre,
        totalKg: +r._sum.kg.toFixed(2),
        visitas: r._count.id,
        ultimoCentro: last?.centroNombre ?? '',
        ultimaFecha: last?.fecha ?? null,
      }
    }))
    res.json(result)
  } catch (err) {
    next(err)
  }
})

// GET /api/reciclajes/top-month — #1 aprobado del mes actual
router.get('/top-month', async (_req, res, next) => {
  try {
    const now = new Date()
    const start = new Date(now.getFullYear(), now.getMonth(), 1)
    const end   = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)

    const rows = await prisma.reciclaje.groupBy({
      by: ['nombre'],
      where: { fecha: { gte: start, lte: end }, estado: 'aprobado' },
      _sum: { kg: true },
      _count: { id: true },
      orderBy: { _sum: { kg: 'desc' } },
      take: 1,
    })
    if (!rows.length) return res.json(null)

    const top = rows[0]
    const last = await prisma.reciclaje.findFirst({
      where: { nombre: top.nombre, fecha: { gte: start, lte: end }, estado: 'aprobado' },
      orderBy: { fecha: 'desc' },
      select: { centroNombre: true },
    })
    res.json({
      nombre: top.nombre,
      totalKg: +top._sum.kg.toFixed(2),
      visitas: top._count.id,
      centroFavorito: last?.centroNombre ?? '',
    })
  } catch (err) {
    next(err)
  }
})

// GET /api/reciclajes/recent — últimos 10 aprobados
router.get('/recent', async (_req, res, next) => {
  try {
    const items = await prisma.reciclaje.findMany({
      where: { estado: 'aprobado' },
      orderBy: { fecha: 'desc' },
      take: 10,
      select: { id: true, nombre: true, centroNombre: true, kg: true, fecha: true },
    })
    res.json(items)
  } catch (err) {
    next(err)
  }
})

// GET /api/reciclajes/pendientes — admin/employee only
router.get('/pendientes', requireAuth, requireRole('admin', 'employee'), async (_req, res, next) => {
  try {
    const items = await prisma.reciclaje.findMany({
      where: { estado: 'pendiente' },
      orderBy: { fecha: 'desc' },
      take: 50,
      select: { id: true, nombre: true, centroNombre: true, kg: true, fecha: true },
    })
    res.json(items)
  } catch (err) {
    next(err)
  }
})

// GET /api/reciclajes/mis?deviceId=xxx — historial del usuario
router.get('/mis', async (req, res, next) => {
  try {
    const { deviceId } = req.query
    if (!deviceId) return res.status(400).json({ error: 'deviceId requerido' })
    const items = await prisma.reciclaje.findMany({
      where: { deviceId },
      orderBy: { fecha: 'desc' },
      take: 20,
      select: { id: true, nombre: true, centroNombre: true, kg: true, estado: true, codigo: true, fecha: true },
    })
    res.json(items)
  } catch (err) {
    next(err)
  }
})

// PATCH /api/reciclajes/:id/aprobar — admin/employee only
router.patch('/:id/aprobar', requireAuth, requireRole('admin', 'employee'), async (req, res, next) => {
  try {
    const { id } = req.params
    const codigo = genCodigo()
    const updated = await prisma.reciclaje.update({
      where: { id },
      data: { estado: 'aprobado', codigo },
    })
    res.json(updated)
  } catch (err) {
    next(err)
  }
})

// PATCH /api/reciclajes/:id/rechazar — admin/employee only
router.patch('/:id/rechazar', requireAuth, requireRole('admin', 'employee'), async (req, res, next) => {
  try {
    const { id } = req.params
    const updated = await prisma.reciclaje.update({
      where: { id },
      data: { estado: 'rechazado' },
    })
    res.json(updated)
  } catch (err) {
    next(err)
  }
})

module.exports = router
