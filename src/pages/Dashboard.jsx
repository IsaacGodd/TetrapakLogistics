import { useState, useMemo, useEffect, useRef } from 'react'
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area,
  ComposedChart, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import { Truck, Package, MapPin, TrendingUp, Users, DollarSign, Filter, Download, Check, FileSpreadsheet, FileText, ChevronDown } from 'lucide-react'
import * as XLSX from 'xlsx'
import { useData } from '../context/DataContext'
import {
  recoleccionMensual, tendenciaViajes, eficienciaOperativa,
  ingresosCostos, distribucionMateriales
} from '../data/mockData'

const statusStyles = {
  'Completado': 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  'En Proceso':  'bg-blue-50   text-blue-700   border border-blue-200',
  'Pendiente':   'bg-amber-50  text-amber-700  border border-amber-200',
  'Cancelado':   'bg-red-50    text-red-600    border border-red-200',
}

const MESES = ['Ene','Feb','Mar','Abr','May','Jun']

function computeEficiencia(selectedData, baseAvg) {
  if (!selectedData.length) return MESES.map(mes => ({ mes, eficiencia: 0 }))
  const selAvg = selectedData.reduce((s, c) => s + c.stats.eficiencia, 0) / selectedData.length
  const shift  = selAvg - baseAvg
  return eficienciaOperativa.map(d => ({
    ...d, eficiencia: Math.min(100, Math.max(0, Math.round(d.eficiencia + shift)))
  }))
}

function computeDistribucion(selectedData) {
  const matTons = {}
  selectedData.forEach(c => {
    const share = c.stats.toneladas / c.materiales.length
    c.materiales.forEach(m => { matTons[m] = (matTons[m] || 0) + share })
  })
  const total = Object.values(matTons).reduce((s, v) => s + v, 0)
  if (!total) return []
  return distribucionMateriales
    .map(d => ({ ...d, value: Math.round((matTons[d.name] || 0) / total * 100) }))
    .filter(d => d.value > 0)
    .sort((a, b) => b.value - a.value)
}

export default function Dashboard() {
  const { centros, viajes } = useData()
  const [selectedIds, setSelectedIds] = useState([])
  const [showExportMenu, setShowExportMenu] = useState(false)
  const exportRef = useRef(null)

  // Close export menu on outside click
  useEffect(() => {
    function handler(e) {
      if (exportRef.current && !exportRef.current.contains(e.target)) setShowExportMenu(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Sync chip selection when centros are imported
  useEffect(() => {
    setSelectedIds(centros.map(c => c.id))
  }, [centros])

  const toggleCentro = id => setSelectedIds(prev =>
    prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
  )
  const selectAll = () => setSelectedIds(centros.map(c => c.id))
  const clearAll  = () => setSelectedIds([])

  const selectedData = useMemo(() => centros.filter(c => selectedIds.includes(c.id)), [selectedIds, centros])

  const kpis = useMemo(() => {
    if (!selectedData.length) return { viajes: 0, toneladas: '0.0', centros: 0, eficiencia: 0, conductores: 0, costos: 0 }
    const tons  = selectedData.reduce((s, c) => s + c.stats.toneladas, 0)
    const efPon = selectedData.reduce((s, c) => s + c.stats.eficiencia * c.stats.toneladas, 0)
    return {
      viajes:      selectedData.reduce((s, c) => s + c.stats.viajes,      0),
      toneladas:   tons.toFixed(1),
      centros:     selectedData.length,
      eficiencia:  tons > 0 ? Math.round(efPon / tons) : 0,
      conductores: selectedData.reduce((s, c) => s + c.stats.conductores, 0),
      costos:      selectedData.reduce((s, c) => s + c.stats.costos,      0),
    }
  }, [selectedData])

  const charts = useMemo(() => {
    const allTons   = centros.reduce((s, c) => s + c.stats.toneladas,   0)
    const allViajes = centros.reduce((s, c) => s + c.stats.viajes,      0)
    const allCostos = centros.reduce((s, c) => s + c.stats.costos,      0)
    const baseAvg   = centros.length ? centros.reduce((s, c) => s + c.stats.eficiencia, 0) / centros.length : 82

    if (!selectedData.length) return {
      recoleccion: MESES.map(mes => ({ mes, toneladas: 0 })),
      tendencia:   MESES.map(mes => ({ mes, viajes:    0 })),
      eficiencia:  MESES.map(mes => ({ mes, eficiencia: 0 })),
      ingresos:    ingresosCostos.map(d => ({ ...d, ingresos: 0, costos: 0, tendencia: 0 })),
      dist:        [],
    }
    const tonR = allTons   > 0 ? selectedData.reduce((s,c) => s + c.stats.toneladas, 0) / allTons   : 0
    const viaR = allViajes > 0 ? selectedData.reduce((s,c) => s + c.stats.viajes,    0) / allViajes : 0
    const cosR = allCostos > 0 ? selectedData.reduce((s,c) => s + c.stats.costos,    0) / allCostos : 0
    return {
      recoleccion: recoleccionMensual.map(d => ({ ...d, toneladas: Math.round(d.toneladas * tonR) })),
      tendencia:   tendenciaViajes.map(d =>    ({ ...d, viajes:    Math.round(d.viajes    * viaR) })),
      eficiencia:  computeEficiencia(selectedData, baseAvg),
      ingresos:    ingresosCostos.map(d => ({
        ...d,
        ingresos:  Math.round(d.ingresos  * cosR),
        costos:    Math.round(d.costos    * cosR),
        tendencia: Math.round(d.tendencia * cosR),
      })),
      dist: computeDistribucion(selectedData),
    }
  }, [selectedData, centros])

  const kpiCards = [
    { key: 'viajes',      label: 'Viajes Totales',       Icon: Truck,      bg: 'bg-blue-500',   fmt: v => v,           delta: '+12%', positive: true,  deltaLabel: 'vs sem anterior' },
    { key: 'toneladas',   label: 'Material Recolectado', Icon: Package,    bg: 'bg-green-500',  fmt: v => `${v} Tons`, delta: '+8%',  positive: true,  deltaLabel: 'vs mes anterior' },
    { key: 'centros',     label: 'Centros Activos',      Icon: MapPin,     bg: 'bg-orange-500', fmt: v => v,           delta: '+5%',  positive: true,  deltaLabel: 'vs mes anterior' },
    { key: 'eficiencia',  label: 'Eficiencia de Ruta',   Icon: TrendingUp, bg: 'bg-purple-500', fmt: v => `${v}%`,     delta: '+5%',  positive: true,  deltaLabel: 'vs mes anterior' },
    { key: 'conductores', label: 'Conductores Activos',  Icon: Users,      bg: 'bg-cyan-500',   fmt: v => v,           delta: '-2%',  positive: false, deltaLabel: 'vs mes anterior' },
    { key: 'costos',      label: 'Costos Operativos',    Icon: DollarSign, bg: 'bg-red-500',    fmt: v => `$${v}`,     delta: '-20%', positive: true,  deltaLabel: 'vs mes anterior' },
  ]

  // ── Export Excel ─────────────────────────────────────────────────────────
  function exportExcel() {
    const wb = XLSX.utils.book_new()

    // Hoja 1: KPIs
    const kpiRows = [
      ['Métrica', 'Valor'],
      ['Viajes Totales', kpis.viajes],
      ['Material Recolectado (Ton)', kpis.toneladas],
      ['Centros Activos', kpis.centros],
      ['Eficiencia de Ruta (%)', kpis.eficiencia],
      ['Conductores Activos', kpis.conductores],
      ['Costos Operativos ($)', kpis.costos],
    ]
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(kpiRows), 'KPIs')

    // Hoja 2: Centros seleccionados
    const centroRows = [
      ['Nombre', 'Dirección', 'Tetrapak', 'Capacidad (ton/sem)', 'Toneladas', 'Viajes', 'Eficiencia %', 'Costos $'],
      ...selectedData.map(c => [
        c.nombre, c.direccion,
        c.tetrapak ? 'Sí' : 'No',
        c.capacidad,
        c.stats.toneladas, c.stats.viajes, c.stats.eficiencia, c.stats.costos,
      ]),
    ]
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(centroRows), 'Centros')

    // Hoja 3: Viajes
    if (viajes.length > 0) {
      const viajeRows = [
        ['ID', 'Fecha', 'Conductor', 'Ruta', 'Toneladas', 'Estado'],
        ...viajes.map(v => [v.id, v.fecha, v.conductor, v.ruta, v.toneladas, v.estado]),
      ]
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(viajeRows), 'Viajes')
    }

    const fecha = new Date().toISOString().slice(0, 10)
    XLSX.writeFile(wb, `reporte-tetrapak-${fecha}.xlsx`)
    setShowExportMenu(false)
  }

  // ── Export PDF (print) ────────────────────────────────────────────────────
  function exportPDF() {
    const fecha = new Date().toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' })
    const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8"/>
  <title>Reporte TetrapakLogistics</title>
  <style>
    body { font-family: Arial, sans-serif; font-size: 11px; color: #1f2937; margin: 24px; }
    h1 { font-size: 18px; color: #1D6ADE; margin-bottom: 4px; }
    .sub { color: #6b7280; font-size: 10px; margin-bottom: 20px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
    th { background: #1D6ADE; color: white; padding: 6px 8px; text-align: left; font-size: 10px; }
    td { padding: 5px 8px; border-bottom: 1px solid #e5e7eb; font-size: 10px; }
    tr:nth-child(even) td { background: #f9fafb; }
    .kpi-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 10px; margin-bottom: 20px; }
    .kpi { border: 1px solid #e5e7eb; border-radius: 8px; padding: 10px; }
    .kpi-label { color: #6b7280; font-size: 9px; margin-bottom: 3px; }
    .kpi-value { font-size: 16px; font-weight: bold; color: #1f2937; }
  </style>
</head>
<body>
  <h1>Reporte de Operaciones — TetrapakLogistics</h1>
  <p class="sub">Generado el ${fecha} · Centros seleccionados: ${kpis.centros}</p>

  <div class="kpi-grid">
    <div class="kpi"><div class="kpi-label">Viajes Totales</div><div class="kpi-value">${kpis.viajes}</div></div>
    <div class="kpi"><div class="kpi-label">Material Recolectado</div><div class="kpi-value">${kpis.toneladas} Ton</div></div>
    <div class="kpi"><div class="kpi-label">Eficiencia de Ruta</div><div class="kpi-value">${kpis.eficiencia}%</div></div>
    <div class="kpi"><div class="kpi-label">Conductores Activos</div><div class="kpi-value">${kpis.conductores}</div></div>
    <div class="kpi"><div class="kpi-label">Centros Activos</div><div class="kpi-value">${kpis.centros}</div></div>
    <div class="kpi"><div class="kpi-label">Costos Operativos</div><div class="kpi-value">$${kpis.costos.toLocaleString()}</div></div>
  </div>

  <table>
    <thead><tr><th>Centro</th><th>Tetrapak</th><th>Toneladas</th><th>Viajes</th><th>Eficiencia %</th><th>Costos $</th></tr></thead>
    <tbody>
      ${selectedData.map(c => `<tr>
        <td>${c.nombre}</td>
        <td>${c.tetrapak ? 'Sí' : 'No'}</td>
        <td>${c.stats.toneladas}</td>
        <td>${c.stats.viajes}</td>
        <td>${c.stats.eficiencia}%</td>
        <td>$${c.stats.costos.toLocaleString()}</td>
      </tr>`).join('')}
    </tbody>
  </table>

  ${viajes.length > 0 ? `
  <table>
    <thead><tr><th>ID</th><th>Fecha</th><th>Conductor</th><th>Ruta</th><th>Toneladas</th><th>Estado</th></tr></thead>
    <tbody>
      ${viajes.map(v => `<tr>
        <td>#${v.id}</td><td>${v.fecha}</td><td>${v.conductor}</td>
        <td>${v.ruta}</td><td>${v.toneladas}</td><td>${v.estado}</td>
      </tr>`).join('')}
    </tbody>
  </table>` : ''}
</body>
</html>`

    const win = window.open('', '_blank')
    win.document.write(html)
    win.document.close()
    win.focus()
    setTimeout(() => { win.print(); win.close() }, 400)
    setShowExportMenu(false)
  }

  return (
    <div className="p-6 space-y-5 bg-gray-50 min-h-full">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Dashboard General</h1>
          <p className="text-sm text-gray-500 mt-0.5">Resumen de operaciones y rendimiento logístico</p>
        </div>
        <div ref={exportRef} className="relative">
          <button
            onClick={() => setShowExportMenu(v => !v)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm rounded-xl font-medium hover:bg-blue-700 transition-all active:scale-95 shadow-sm"
          >
            <Download size={15} strokeWidth={2} /> Exportar
            <ChevronDown size={13} strokeWidth={2.5} className={`transition-transform ${showExportMenu ? 'rotate-180' : ''}`} />
          </button>
          {showExportMenu && (
            <div className="absolute right-0 top-full mt-1 w-44 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
              <button
                onClick={exportExcel}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <FileSpreadsheet size={15} className="text-green-600" /> Excel (.xlsx)
              </button>
              <button
                onClick={exportPDF}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <FileText size={15} className="text-red-500" /> PDF
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ---- FILTRO CENTROS ---- */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
            <Filter size={16} className="text-primary" strokeWidth={2} />
            Filtrar por Centro de Acopio
          </div>
          <div className="flex gap-2 text-xs items-center">
            <span className="text-gray-400 font-medium mr-1">{selectedIds.length}/{centros.length} seleccionados</span>
            <button onClick={selectAll} className="px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 font-medium transition active:scale-95">Seleccionar Todos</button>
            <button onClick={clearAll}  className="px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 font-medium transition active:scale-95">Limpiar</button>
          </div>
        </div>
        {centros.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">
            Sin centros cargados. <a href="/importar" className="text-primary hover:underline font-medium">Importa un CSV</a> para comenzar.
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
            {centros.map(centro => {
              const active = selectedIds.includes(centro.id)
              return (
                <button
                  key={centro.id}
                  onClick={() => toggleCentro(centro.id)}
                  className={`px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 active:scale-95 text-left border ${
                    active
                      ? 'bg-gray-800 text-white border-gray-800 shadow-sm'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400 hover:bg-gray-50'
                  }`}
                >
                  <div className="font-semibold leading-tight truncate">{centro.nombre}</div>
                  <div className={`text-xs mt-0.5 flex items-center gap-1 ${
                    active
                      ? (centro.movil ? 'text-orange-300' : centro.tetrapak ? 'text-green-300' : 'text-gray-400')
                      : (centro.movil ? 'text-orange-500' : centro.tetrapak ? 'text-green-600' : 'text-gray-400')
                  }`}>
                    {centro.movil
                      ? <span>📍 Móvil</span>
                      : centro.tetrapak
                        ? <><Check size={10} strokeWidth={3} /> Tetrapak</>
                        : 'Sin Tetrapak'
                    }
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* ---- KPI CARDS ---- */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {kpiCards.map(({ key, label, Icon, bg, fmt, delta, positive, deltaLabel }) => (
          <div key={key} className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center justify-between shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5">
            <div>
              <p className="text-xs text-gray-500 font-medium mb-1">{label}</p>
              <p className="text-3xl font-bold text-gray-900 leading-none transition-all duration-300">
                {fmt(kpis[key])}
              </p>
              <p className={`text-xs mt-2 font-semibold flex items-center gap-1 ${positive ? 'text-green-600' : 'text-red-500'}`}>
                <span className="text-base leading-none">{positive ? '↑' : '↓'}</span>
                <span>{delta} {deltaLabel}</span>
              </p>
            </div>
            <div className={`w-12 h-12 ${bg} rounded-2xl flex items-center justify-center shadow-sm shrink-0`}>
              <Icon size={22} strokeWidth={1.8} className="text-white" />
            </div>
          </div>
        ))}
      </div>

      {/* ---- CHARTS ROW 1 ---- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="Recolección Mensual por Tipo">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={charts.recoleccion} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="mes" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 10, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: 12 }} cursor={{ fill: '#f8fafc' }} />
              <Bar dataKey="toneladas" fill="#1D6ADE" radius={[6,6,0,0]} name="Toneladas" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Tendencia de Viajes">
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={charts.tendencia} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="mes" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 10, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: 12 }} />
              <Line type="monotone" dataKey="viajes" stroke="#10B981" strokeWidth={2.5} dot={{ fill: '#10B981', r: 4, strokeWidth: 0 }} activeDot={{ r: 6 }} name="Viajes" />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* ---- CHARTS ROW 2 ---- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="Eficiencia Operativa (%)">
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={charts.eficiencia} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="efGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#F97316" stopOpacity={0.5}/>
                  <stop offset="95%" stopColor="#F97316" stopOpacity={0.02}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="mes" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 10, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: 12 }} />
              <Area type="monotone" dataKey="eficiencia" stroke="#F97316" fill="url(#efGrad)" strokeWidth={2.5} dot={{ fill: '#F97316', r: 4, strokeWidth: 0 }} activeDot={{ r: 6 }} name="Eficiencia %" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Ingresos vs Costos">
          <ResponsiveContainer width="100%" height={200}>
            <ComposedChart data={charts.ingresos} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="ingGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#8B5CF6" stopOpacity={0.5}/>
                  <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.02}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="mes" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 10, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: 12 }} />
              <Legend iconSize={8} wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
              <Area type="monotone" dataKey="ingresos" fill="url(#ingGrad)" stroke="#8B5CF6" strokeWidth={2} name="Ingresos" />
              <Bar dataKey="costos" fill="#3730a3" radius={[4,4,0,0]} name="Costos" opacity={0.85} />
              <Line type="monotone" dataKey="tendencia" stroke="#F97316" strokeWidth={2} dot={{ fill:'#F97316', r:3, strokeWidth:0 }} name="Tendencia Costos" />
            </ComposedChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* ---- DISTRIBUCIÓN DE MATERIALES ---- */}
      <ChartCard title="Distribución de Materiales">
        {charts.dist.length === 0 ? (
          <div className="h-40 flex items-center justify-center text-gray-400 text-sm">
            {centros.length === 0
              ? 'Importa centros de acopio para ver la distribución'
              : 'Selecciona al menos un centro'}
          </div>
        ) : (
          <div className="flex flex-col md:flex-row items-center gap-6">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={charts.dist} cx="50%" cy="50%" outerRadius={90} innerRadius={30} dataKey="value" paddingAngle={2}>
                  {charts.dist.map((entry, i) => <Cell key={i} fill={entry.color} stroke="none" />)}
                </Pie>
                <Tooltip formatter={v => `${v}%`} contentStyle={{ borderRadius: 10, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2 shrink-0">
              {charts.dist.map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-xs">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: item.color }} />
                  <span className="text-gray-600">{item.name} <strong className="text-gray-800">{item.value}%</strong></span>
                </div>
              ))}
            </div>
          </div>
        )}
      </ChartCard>

      {/* ---- REGISTROS RECIENTES ---- */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-800">Registros Recientes</h3>
          <select className="text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 text-gray-600 focus:outline-none focus:border-primary cursor-pointer">
            <option>Estado</option>
            <option>Completado</option><option>En Proceso</option><option>Pendiente</option><option>Cancelado</option>
          </select>
        </div>
        {viajes.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6">
            Sin registros. <a href="/importar" className="text-primary hover:underline font-medium">Importa viajes</a> para verlos aquí.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  {['ID','Fecha','Conductor','Ruta','Toneladas','Estado'].map(h => (
                    <th key={h} className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide pb-3 pr-4 first:pl-1">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {viajes.map(v => (
                  <tr key={v.id} className="hover:bg-gray-50/70 transition-colors duration-150">
                    <td className="py-3 pr-4 pl-1 text-gray-400 font-mono text-xs">#{v.id}</td>
                    <td className="py-3 pr-4 text-gray-600 text-xs">{v.fecha}</td>
                    <td className="py-3 pr-4 text-gray-800 font-medium text-xs">{v.conductor}</td>
                    <td className="py-3 pr-4 text-gray-600 text-xs">{v.ruta}</td>
                    <td className="py-3 pr-4 text-gray-800 font-semibold text-xs">{v.toneladas}</td>
                    <td className="py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusStyles[v.estado] || 'bg-gray-100 text-gray-600'}`}>
                        {v.estado}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

function ChartCard({ title, children }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all duration-200">
      <h3 className="text-sm font-semibold text-gray-800 mb-4">{title}</h3>
      {children}
    </div>
  )
}
