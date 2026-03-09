const express = require('express')
const { PrismaClient } = require('@prisma/client')
const { requireAuth, requireRole } = require('../middleware/auth')

const router = express.Router()
const prisma = new PrismaClient()

// GET /api/viajes  — admin/employee
router.get('/', requireAuth, requireRole('admin', 'employee'), async (req, res, next) => {
  try {
    const { transportistaId, estado, limit = 50 } = req.query
    const viajes = await prisma.viaje.findMany({
      where: {
        ...(transportistaId && { transportistaId }),
        ...(estado && { estado }),
      },
      include: {
        transportista: { select: { nombre: true, placa: true, color: true } },
        visitas: { include: { centro: { select: { nombre: true } } } },
      },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit),
    })
    res.json(viajes)
  } catch (err) { next(err) }
})

// GET /api/viajes/:id
router.get('/:id', requireAuth, async (req, res, next) => {
  try {
    const viaje = await prisma.viaje.findUnique({
      where: { id: req.params.id },
      include: {
        transportista: true,
        visitas: { include: { centro: true } },
      },
    })
    if (!viaje) return res.status(404).json({ error: 'Viaje no encontrado' })
    res.json(viaje)
  } catch (err) { next(err) }
})

// POST /api/viajes  — admin/employee
router.post('/', requireAuth, requireRole('admin', 'employee'), async (req, res, next) => {
  try {
    const { transportistaId, origen, destino, distanciaKm, duracionMin, toneladas, costo, centroIds = [] } = req.body
    const viaje = await prisma.viaje.create({
      data: {
        transportistaId, origen, destino,
        distanciaKm: parseFloat(distanciaKm) || 0,
        duracionMin: parseInt(duracionMin) || 0,
        toneladas: parseFloat(toneladas) || 0,
        costo: parseFloat(costo) || 0,
        visitas: {
          create: centroIds.map(centroId => ({
            centroId,
            transportistaId,
          })),
        },
      },
      include: { visitas: true },
    })
    res.status(201).json(viaje)
  } catch (err) { next(err) }
})

// PATCH /api/viajes/:id/estado  — actualiza estado (ej: en_progreso → completado)
router.patch('/:id/estado', requireAuth, requireRole('admin', 'employee', 'transportista'), async (req, res, next) => {
  try {
    const { estado } = req.body
    const data = { estado }
    if (estado === 'en_progreso') data.iniciadoEn = new Date()
    if (estado === 'completado' || estado === 'cancelado') data.finalizadoEn = new Date()

    const viaje = await prisma.viaje.update({ where: { id: req.params.id }, data })
    res.json(viaje)
  } catch (err) { next(err) }
})

// POST /api/viajes/:id/visitas/:visitaId/llegada — registra llegada a un centro
router.post('/:id/visitas/:visitaId/llegada', requireAuth, async (req, res, next) => {
  try {
    const visita = await prisma.visita.update({
      where: { id: req.params.visitaId },
      data: { llegadaReal: new Date() },
    })
    res.json(visita)
  } catch (err) { next(err) }
})

// POST /api/viajes/:id/visitas/:visitaId/salida — registra salida de un centro
router.post('/:id/visitas/:visitaId/salida', requireAuth, async (req, res, next) => {
  try {
    const visita = await prisma.visita.update({
      where: { id: req.params.visitaId },
      data: { salidaReal: new Date() },
    })
    res.json(visita)
  } catch (err) { next(err) }
})

// GET /api/viajes/stats/resumen  — KPIs para dashboard
router.get('/stats/resumen', requireAuth, requireRole('admin', 'employee'), async (_req, res, next) => {
  try {
    const [totalViajes, viajesCompletados, agg] = await Promise.all([
      prisma.viaje.count(),
      prisma.viaje.count({ where: { estado: 'completado' } }),
      prisma.viaje.aggregate({
        _sum: { toneladas: true, costo: true, distanciaKm: true },
      }),
    ])
    res.json({
      totalViajes,
      viajesCompletados,
      totalToneladas: agg._sum.toneladas || 0,
      totalCosto: agg._sum.costo || 0,
      totalKm: agg._sum.distanciaKm || 0,
    })
  } catch (err) { next(err) }
})

module.exports = router
