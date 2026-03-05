import { useState } from 'react'
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area,
  ComposedChart, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import {
  Truck, Package, MapPin, TrendingUp, Users, DollarSign,
  Filter, Download, Check
} from 'lucide-react'
import {
  centros, viajes, kpis,
  recoleccionMensual, tendenciaViajes, eficienciaOperativa,
  ingresosCostos, distribucionMateriales
} from '../data/mockData'

const statusStyles = {
  'Completado': 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  'En Proceso':  'bg-blue-50   text-blue-700   border border-blue-200',
  'Pendiente':   'bg-amber-50  text-amber-700  border border-amber-200',
  'Cancelado':   'bg-red-50    text-red-600    border border-red-200',
}

const kpiCards = [
  { key: 'viajesTotales',       label: 'Viajes Totales',       Icon: Truck,       bg: 'bg-blue-500'   },
  { key: 'materialRecolectado', label: 'Material Recolectado', Icon: Package,     bg: 'bg-green-500'  },
  { key: 'conductoresActivos',  label: 'Centros Activos',      Icon: MapPin,      bg: 'bg-orange-500' },
  { key: 'eficienciaRuta',      label: 'Eficiencia de Ruta',   Icon: TrendingUp,  bg: 'bg-purple-500' },
  { key: 'conductoresActivos2', label: 'Conductores Activos',  Icon: Users,       bg: 'bg-cyan-500'   },
  { key: 'costosOperativos',    label: 'Costos Operativos',    Icon: DollarSign,  bg: 'bg-red-500'    },
]

export default function Dashboard() {
  const [selectedCentros, setSelectedCentros] = useState(centros.map(c => c.id))

  const toggleCentro = (id) => {
    setSelectedCentros(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }
  const selectAll = () => setSelectedCentros(centros.map(c => c.id))
  const clearAll  = () => setSelectedCentros([])

  return (
    <div className="p-6 space-y-5 min-h-full bg-gray-50">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 leading-tight">Dashboard General</h1>
          <p className="text-sm text-gray-500 mt-0.5">Resumen de operaciones y rendimiento logístico</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm rounded-xl font-medium hover:bg-blue-700 transition-all duration-200 active:scale-95 shadow-sm">
          <Download size={15} strokeWidth={2} />
          Exportar Reporte
        </button>
      </div>

      {/* Filtro Centros */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
            <Filter size={16} className="text-primary" strokeWidth={2} />
            Filtrar por Centro de Acopio
          </div>
          <div className="flex gap-2">
            <button onClick={selectAll} className="text-xs px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 font-medium transition-all duration-200 active:scale-95">Seleccionar Todos</button>
            <button onClick={clearAll}  className="text-xs px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 font-medium transition-all duration-200 active:scale-95">Limpiar</button>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          {centros.map(centro => {
            const active = selectedCentros.includes(centro.id)
            return (
              <button
                key={centro.id}
                onClick={() => toggleCentro(centro.id)}
                className={`px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 active:scale-95 text-left ${
                  active
                    ? 'bg-gray-800 text-white shadow-sm'
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-400 hover:bg-gray-50'
                }`}
              >
                <div className="font-semibold leading-tight truncate">{centro.nombre}</div>
                <div className={`text-xs mt-0.5 flex items-center gap-1 ${active ? (centro.tetrapak ? 'text-green-300' : 'text-gray-400') : (centro.tetrapak ? 'text-green-600' : 'text-gray-400')}`}>
                  {centro.tetrapak && <Check size={10} strokeWidth={3} />}
                  {centro.tetrapak ? 'Tetrapak' : 'Sin Tetrapak'}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {kpiCards.map(({ key, label, Icon, bg }) => {
          const data = kpis[key]
          return (
            <div key={key} className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center justify-between shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5">
              <div>
                <p className="text-xs text-gray-500 font-medium mb-1">{label}</p>
                <p className="text-3xl font-bold text-gray-900 leading-none">{data.value}</p>
                <p className={`text-xs mt-2 font-medium ${data.positive ? 'text-emerald-600' : 'text-red-500'}`}>
                  {data.delta}
                </p>
              </div>
              <div className={`w-12 h-12 ${bg} rounded-2xl flex items-center justify-center shadow-sm shrink-0`}>
                <Icon size={22} strokeWidth={1.8} className="text-white" />
              </div>
            </div>
          )
        })}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="Recolección Mensual por Tipo">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={recoleccionMensual} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
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
            <LineChart data={tendenciaViajes} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="mes" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 10, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: 12 }} />
              <Line type="monotone" dataKey="viajes" stroke="#10B981" strokeWidth={2.5} dot={{ fill: '#10B981', r: 4, strokeWidth: 0 }} activeDot={{ r: 6 }} name="Viajes" />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="Eficiencia Operativa (%)">
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={eficienciaOperativa} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="efGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#F97316" stopOpacity={0.5}/>
                  <stop offset="95%" stopColor="#F97316" stopOpacity={0.02}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="mes" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis domain={[60,100]} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 10, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: 12 }} />
              <Area type="monotone" dataKey="eficiencia" stroke="#F97316" fill="url(#efGrad)" strokeWidth={2.5} dot={{ fill: '#F97316', r: 4, strokeWidth: 0 }} activeDot={{ r: 6 }} name="Eficiencia %" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Ingresos vs Costos">
          <ResponsiveContainer width="100%" height={200}>
            <ComposedChart data={ingresosCostos} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
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

      {/* Distribución de Materiales */}
      <ChartCard title="Distribución de Materiales">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={distribucionMateriales} cx="50%" cy="50%" outerRadius={90} innerRadius={30} dataKey="value" paddingAngle={2}>
                {distribucionMateriales.map((entry, i) => (
                  <Cell key={i} fill={entry.color} stroke="none" />
                ))}
              </Pie>
              <Tooltip formatter={v => `${v}%`} contentStyle={{ borderRadius: 10, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-x-6 gap-y-2 shrink-0">
            {distribucionMateriales.map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-xs">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: item.color }} />
                <span className="text-gray-600">{item.name} <strong className="text-gray-800">{item.value}%</strong></span>
              </div>
            ))}
          </div>
        </div>
      </ChartCard>

      {/* Registros Recientes */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-800">Registros Recientes</h3>
          <select className="text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 text-gray-600 focus:outline-none focus:border-primary transition-colors cursor-pointer">
            <option>Estado</option>
            <option>Completado</option>
            <option>En Proceso</option>
            <option>Pendiente</option>
            <option>Cancelado</option>
          </select>
        </div>
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
                <tr key={v.id} className="hover:bg-gray-50/70 transition-colors duration-150 group">
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
