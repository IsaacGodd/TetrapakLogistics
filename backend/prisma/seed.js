/**
 * Seed script — pobla la base de datos con datos demo
 * Ejecutar: npm run db:seed
 */
require('dotenv').config()
const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // ── Usuarios ──────────────────────────────────────────────────────────────
  const users = await Promise.all([
    prisma.user.upsert({
      where: { email: 'admin@tetrapak.mx' },
      update: {},
      create: {
        nombre: 'Administrador',
        email: 'admin@tetrapak.mx',
        password: await bcrypt.hash('admin123', 10),
        role: 'admin',
      },
    }),
    prisma.user.upsert({
      where: { email: 'empleado@tetrapak.mx' },
      update: {},
      create: {
        nombre: 'Empleado Demo',
        email: 'empleado@tetrapak.mx',
        password: await bcrypt.hash('empleado123', 10),
        role: 'employee',
      },
    }),
    prisma.user.upsert({
      where: { email: 'juan@tetrapak.mx' },
      update: {},
      create: {
        nombre: 'Juan Pérez',
        email: 'juan@tetrapak.mx',
        password: await bcrypt.hash('trans123', 10),
        role: 'transportista',
      },
    }),
    prisma.user.upsert({
      where: { email: 'maria@tetrapak.mx' },
      update: {},
      create: {
        nombre: 'María López',
        email: 'maria@tetrapak.mx',
        password: await bcrypt.hash('trans123', 10),
        role: 'transportista',
      },
    }),
  ])

  console.log(`✅ ${users.length} usuarios creados`)

  // ── Centros de Acopio ─────────────────────────────────────────────────────
  const centrosData = [
    {
      nombre: 'Centro Ecolana Cumbres',
      direccion: 'Av. Cumbres Elite 1200, Monterrey',
      horario: '08:00 - 18:00',
      telefono: '81-1234-5678',
      lat: 25.7519, lng: -100.3672,
      tetrapak: true, movil: false, capacidad: 12,
      dias: ['Lun', 'Mié', 'Vie'],
      materiales: ['Tetrapak', 'Cartón', 'Plástico', 'Vidrio'],
      stats: { toneladas: 380, viajes: 42, eficiencia: 85, conductores: 3, costos: 12400 },
    },
    {
      nombre: 'Punto Verde San Pedro',
      direccion: 'Blvd. Díaz Ordaz 300, San Pedro Garza García',
      horario: '09:00 - 17:00',
      telefono: '81-2345-6789',
      lat: 25.6564, lng: -100.4042,
      tetrapak: false, movil: false, capacidad: 8,
      dias: ['Lun', 'Mar', 'Jue', 'Sáb'],
      materiales: ['Plástico', 'PET', 'Aluminio', 'Vidrio'],
      stats: { toneladas: 210, viajes: 28, eficiencia: 79, conductores: 2, costos: 7800 },
    },
    {
      nombre: 'Ecocentro Santa Catarina',
      direccion: 'Carr. Nacional km 12, Santa Catarina',
      horario: '07:00 - 16:00',
      telefono: '81-3456-7890',
      lat: 25.6738, lng: -100.4589,
      tetrapak: true, movil: false, capacidad: 15,
      dias: ['Mar', 'Jue', 'Sáb'],
      materiales: ['Tetrapak', 'Papel', 'Cartón', 'Metal'],
      stats: { toneladas: 460, viajes: 55, eficiencia: 88, conductores: 4, costos: 15200 },
    },
    {
      nombre: 'Recicladora Apodaca Norte',
      direccion: 'Av. Sendero Nacional 500, Apodaca',
      horario: '08:00 - 20:00',
      telefono: '81-4567-8901',
      lat: 25.7714, lng: -100.1989,
      tetrapak: true, movil: false, capacidad: 20,
      dias: ['Lun', 'Mié', 'Vie', 'Dom'],
      materiales: ['Tetrapak', 'PET', 'Plástico', 'Aluminio', 'Vidrio'],
      stats: { toneladas: 610, viajes: 70, eficiencia: 91, conductores: 5, costos: 19800 },
    },
    {
      nombre: 'Centro de Acopio Guadalupe',
      direccion: 'Av. Pablo González 800, Guadalupe',
      horario: '09:00 - 18:00',
      telefono: '81-5678-9012',
      lat: 25.6776, lng: -100.2626,
      tetrapak: false, movil: false, capacidad: 10,
      dias: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie'],
      materiales: ['Cartón', 'Papel', 'Plástico', 'PET'],
      stats: { toneladas: 295, viajes: 38, eficiencia: 82, conductores: 2, costos: 9600 },
    },
    {
      nombre: 'Eco Punto San Nicolás',
      direccion: 'Av. Universidad 1600, San Nicolás de los Garza',
      horario: '08:00 - 17:00',
      telefono: '81-6789-0123',
      lat: 25.7456, lng: -100.3012,
      tetrapak: true, movil: false, capacidad: 18,
      dias: ['Lun', 'Mié', 'Vie', 'Sáb'],
      materiales: ['Tetrapak', 'Vidrio', 'Metal', 'Aluminio'],
      stats: { toneladas: 520, viajes: 61, eficiencia: 87, conductores: 4, costos: 17100 },
    },
  ]

  const centros = []
  for (const { stats, ...centroData } of centrosData) {
    const centro = await prisma.centro.upsert({
      where: { id: centroData.nombre }, // fallback único
      update: {},
      create: {
        ...centroData,
        stats: { create: stats },
      },
    }).catch(async () => {
      // si el upsert falla (por id no ser nombre), busca o crea
      const existing = await prisma.centro.findFirst({ where: { nombre: centroData.nombre } })
      if (existing) return existing
      return prisma.centro.create({
        data: { ...centroData, stats: { create: stats } },
      })
    })
    centros.push(centro)
  }

  console.log(`✅ ${centros.length} centros creados`)

  // ── Transportistas ────────────────────────────────────────────────────────
  const juanUser = users.find(u => u.email === 'juan@tetrapak.mx')
  const mariaUser = users.find(u => u.email === 'maria@tetrapak.mx')

  const transportistasData = [
    { nombre: 'Juan Pérez',    vehiculo: 'Camión 3.5T', placa: 'NL-001-TK', color: '#EF4444', estado: 'en_ruta',     lat: 25.6866, lng: -100.3161, velocidad: 45, userId: juanUser.id },
    { nombre: 'María López',   vehiculo: 'Van de Carga', placa: 'NL-002-TK', color: '#10B981', estado: 'descansando', lat: 25.7200, lng: -100.2800, velocidad: 40, userId: mariaUser.id },
    { nombre: 'Roberto Silva', vehiculo: 'Pickup 1T',   placa: 'NL-003-TK', color: '#F59E0B', estado: 'en_ruta',     lat: 25.6500, lng: -100.4000, velocidad: 50 },
    { nombre: 'Ana Castro',    vehiculo: 'Camión 5T',   placa: 'NL-004-TK', color: '#8B5CF6', estado: 'sin_asignar', lat: 25.7500, lng: -100.3500, velocidad: 35 },
  ]

  const transportistas = []
  for (const tData of transportistasData) {
    const t = await prisma.transportista.upsert({
      where: { placa: tData.placa },
      update: {},
      create: tData,
    })
    transportistas.push(t)
  }

  console.log(`✅ ${transportistas.length} transportistas creados`)

  // ── Viajes demo ───────────────────────────────────────────────────────────
  const viajesData = [
    {
      transportistaId: transportistas[0].id,
      origen: 'Depósito Central', destino: 'Ruta Norte',
      distanciaKm: 45.2, duracionMin: 62, toneladas: 3.8, costo: 1250,
      estado: 'completado',
      iniciadoEn: new Date('2025-12-01T08:00:00'),
      finalizadoEn: new Date('2025-12-01T09:02:00'),
      centroIds: [centros[0]?.id, centros[3]?.id].filter(Boolean),
    },
    {
      transportistaId: transportistas[1].id,
      origen: 'Depósito Central', destino: 'Ruta Sur',
      distanciaKm: 31.5, duracionMin: 48, toneladas: 2.1, costo: 890,
      estado: 'completado',
      iniciadoEn: new Date('2025-12-02T09:00:00'),
      finalizadoEn: new Date('2025-12-02T09:48:00'),
      centroIds: [centros[1]?.id, centros[4]?.id].filter(Boolean),
    },
    {
      transportistaId: transportistas[2].id,
      origen: 'Depósito Central', destino: 'Ruta Oeste',
      distanciaKm: 28.9, duracionMin: 41, toneladas: 1.9, costo: 740,
      estado: 'en_progreso',
      iniciadoEn: new Date(),
      centroIds: [centros[2]?.id].filter(Boolean),
    },
  ]

  for (const { centroIds, ...viajeData } of viajesData) {
    await prisma.viaje.create({
      data: {
        ...viajeData,
        visitas: {
          create: centroIds.map(centroId => ({
            centroId,
            transportistaId: viajeData.transportistaId,
          })),
        },
      },
    })
  }

  console.log(`✅ ${viajesData.length} viajes creados`)
  console.log('\n🎉 Seed completado. Credenciales de prueba:')
  console.log('   admin@tetrapak.mx    / admin123')
  console.log('   empleado@tetrapak.mx / empleado123')
  console.log('   juan@tetrapak.mx     / trans123')
}

main()
  .catch(e => { console.error('❌ Seed falló:', e); process.exit(1) })
  .finally(() => prisma.$disconnect())
