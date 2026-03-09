// ===================== USUARIOS =====================
export const users = [
  { id: 1, username: 'admin',         password: 'admin123',    role: 'admin',         name: 'Carlos Admin', email: 'admin@tetrapak.com'  },
  { id: 2, username: 'empleado',      password: 'empleado123', role: 'employee',      name: 'Ana García',   email: 'ana@tetrapak.com'    },
  { id: 3, username: 'transportista', password: 'trans123',    role: 'transportista', name: 'Juan Pérez',   email: 'juan@tetrapak.com'   },
  { id: 4, username: 'tester',        password: 'tester123',   role: 'tester',        name: 'Test User',    email: 'tester@tetrapak.com' },
]

// ===================== CENTROS DE ACOPIO =====================
// Vacío — se puebla mediante importación CSV/Excel en /importar
export const centros = []

// ===================== VIAJES / REGISTROS =====================
// Vacío — se puebla mediante importación CSV/Excel en /importar
export const viajes = []

// ===================== KPIs (base estática) =====================
export const kpis = {
  viajesTotales:       { value: 0,    delta: '0% vs sem anterior', positive: true },
  materialRecolectado: { value: '0',  delta: '0% vs mes anterior', positive: true },
  conductoresActivos:  { value: 0,    delta: '0% vs mes anterior', positive: true },
  eficienciaRuta:      { value: '0%', delta: '0% vs mes anterior', positive: true },
  costosOperativos:    { value: '$0', delta: '0% vs mes anterior', positive: true },
}

// ===================== CHART DATA (base para escala proporcional) =====================
export const recoleccionMensual = [
  { mes: 'Ene', toneladas: 2200 },
  { mes: 'Feb', toneladas: 1800 },
  { mes: 'Mar', toneladas: 9500 },
  { mes: 'Abr', toneladas: 2500 },
  { mes: 'May', toneladas: 3800 },
  { mes: 'Jun', toneladas: 3200 },
]

export const tendenciaViajes = [
  { mes: 'Ene', viajes: 320 },
  { mes: 'Feb', viajes: 280 },
  { mes: 'Mar', viajes: 200 },
  { mes: 'Abr', viajes: 310 },
  { mes: 'May', viajes: 290 },
  { mes: 'Jun', viajes: 250 },
]

export const eficienciaOperativa = [
  { mes: 'Ene', eficiencia: 82 },
  { mes: 'Feb', eficiencia: 79 },
  { mes: 'Mar', eficiencia: 81 },
  { mes: 'Abr', eficiencia: 83 },
  { mes: 'May', eficiencia: 80 },
  { mes: 'Jun', eficiencia: 84 },
]

export const ingresosCostos = [
  { mes: 'Ene', ingresos: 1400, costos: 800,  tendencia: 1100 },
  { mes: 'Feb', ingresos: 1500, costos: 750,  tendencia: 1125 },
  { mes: 'Mar', ingresos: 1300, costos: 900,  tendencia: 1100 },
  { mes: 'Abr', ingresos: 1600, costos: 820,  tendencia: 1210 },
  { mes: 'May', ingresos: 1450, costos: 780,  tendencia: 1115 },
]

export const distribucionMateriales = [
  { name: 'Vidrio',       value: 14, color: '#10B981' },
  { name: 'Plástico',     value: 16, color: '#F59E0B' },
  { name: 'Cartón',       value: 32, color: '#3B82F6' },
  { name: 'Metal',        value: 5,  color: '#6B7280' },
  { name: 'Poliestireno', value: 8,  color: '#8B5CF6' },
  { name: 'PET',          value: 8,  color: '#EC4899' },
  { name: 'Aluminio',     value: 6,  color: '#14B8A6' },
  { name: 'Papel',        value: 9,  color: '#F97316' },
  { name: 'Polialuminio', value: 2,  color: '#7C3AED' },
]

// ===================== TRANSPORTISTAS =====================
export const transportistas = [
  {
    id: 't1',
    nombre: 'Juan Pérez',
    vehiculo: 'Camión 3.5T',
    placa: 'NL-001-TK',
    color: '#EF4444',
    estado: 'en_ruta',
    lat: 25.6866,
    lng: -100.3161,
    velocidad: 45,
    rutaAsignada: [],
  },
  {
    id: 't2',
    nombre: 'María López',
    vehiculo: 'Van de Carga',
    placa: 'NL-002-TK',
    color: '#10B981',
    estado: 'descansando',
    lat: 25.7200,
    lng: -100.2800,
    velocidad: 40,
    rutaAsignada: [],
  },
  {
    id: 't3',
    nombre: 'Roberto Silva',
    vehiculo: 'Pickup 1T',
    placa: 'NL-003-TK',
    color: '#F59E0B',
    estado: 'en_ruta',
    lat: 25.6500,
    lng: -100.4000,
    velocidad: 50,
    rutaAsignada: [],
  },
  {
    id: 't4',
    nombre: 'Ana Castro',
    vehiculo: 'Camión 5T',
    placa: 'NL-004-TK',
    color: '#8B5CF6',
    estado: 'sin_asignar',
    lat: 25.7500,
    lng: -100.3500,
    velocidad: 35,
    rutaAsignada: [],
  },
]

export const diasSemana = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

export const materialesLista = [
  'Todos los materiales', 'Tetrapak', 'Plástico', 'Vidrio',
  'Cartón', 'Papel', 'Metal', 'Aluminio', 'PET', 'Poliestireno', 'Polialuminio',
]
