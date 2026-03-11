import { useRecycling } from '../context/RecyclingContext'
import { Trophy, Users, Recycle, Clock, CheckCircle, XCircle, HourglassIcon } from 'lucide-react'
import { useState, useEffect } from 'react'
import trofeoImg from '../images/icons/trofeo.png'
import medallaOroImg from '../images/icons/medalla-oro.png'
import medallaPlataImg from '../images/icons/medalla-plata.png'
import medallaBronceImg from '../images/icons/medalla-bronce.png'
import tetrapakIconImg from '../images/icons/tetrapak-icon.png'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

function getDeviceId() {
  return localStorage.getItem('tl_device_id')
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins  = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days  = Math.floor(diff / 86400000)
  if (mins < 2)   return 'hace un momento'
  if (mins < 60)  return `hace ${mins} min`
  if (hours < 24) return `hace ${hours}h`
  return `hace ${days}d`
}

const MEDAL_IMGS = [medallaOroImg, medallaPlataImg, medallaBronceImg]

const ESTADO_CONFIG = {
  pendiente:  { icon: HourglassIcon, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20', label: 'Pendiente' },
  aprobado:   { icon: CheckCircle,   color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20',  label: 'Aprobado' },
  rechazado:  { icon: XCircle,       color: 'text-red-500',   bg: 'bg-red-50 dark:bg-red-900/20',      label: 'Rechazado' },
}

export default function Comunidad() {
  const { leaderboard, topRecyclerMonth, recent, loading } = useRecycling()
  const [mis, setMis] = useState([])
  const [misLoading, setMisLoading] = useState(false)

  useEffect(() => {
    const deviceId = getDeviceId()
    if (!deviceId) return
    setMisLoading(true)
    fetch(`${BASE_URL}/api/reciclajes/mis?deviceId=${encodeURIComponent(deviceId)}`)
      .then(r => r.json())
      .then(data => setMis(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setMisLoading(false))
  }, [])

  const totalPersonas = leaderboard.length
  const totalKgGlobal = leaderboard.reduce((s, r) => s + r.totalKg, 0).toFixed(1)

  if (loading) {
    return (
      <div className="p-6 space-y-4 animate-pulse">
        <div className="h-40 bg-gray-200 rounded-2xl" />
        <div className="h-6 bg-gray-200 rounded w-1/3" />
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => <div key={i} className="h-12 bg-gray-100 rounded-xl" />)}
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 lg:p-6 space-y-5 bg-app-bg min-h-full">

      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Comunidad Recicladora</h1>
        <p className="text-sm text-gray-500 mt-0.5">Personas que están haciendo la diferencia en Monterrey</p>
      </div>

      {/* ── Top reciclador del mes ── */}
      {topRecyclerMonth ? (
        <div className="bg-gradient-to-br from-green-500 via-emerald-500 to-teal-600 rounded-2xl p-5 text-white shadow-lg">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center shrink-0 p-2">
              <img src={trofeoImg} alt="trofeo" className="w-full h-full object-contain" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wider text-white/70 mb-0.5">Reciclador del mes</p>
              <h2 className="text-2xl font-black leading-tight truncate">{topRecyclerMonth.nombre}</h2>
              <div className="flex flex-wrap gap-3 mt-2">
                <span className="bg-white/20 px-2.5 py-1 rounded-lg text-xs font-semibold">
                  {topRecyclerMonth.totalKg} kg reciclados
                </span>
                <span className="bg-white/20 px-2.5 py-1 rounded-lg text-xs font-semibold">
                  {topRecyclerMonth.visitas} visitas
                </span>
                {topRecyclerMonth.centroFavorito && (
                  <span className="bg-white/20 px-2.5 py-1 rounded-lg text-xs font-semibold truncate max-w-[180px]">
                    📍 {topRecyclerMonth.centroFavorito}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-5 border border-dashed border-gray-300 dark:border-gray-700 text-center">
          <img src={trofeoImg} alt="trofeo" className="w-12 h-12 object-contain mx-auto mb-2" />
          <p className="text-sm font-semibold text-gray-600 dark:text-gray-300">¡Sé el primero en reciclar este mes!</p>
          <p className="text-xs text-gray-400 mt-1">Ve a Centros de Acopio y registra tu reciclaje</p>
        </div>
      )}

      {/* ── Mis reciclajes ── */}
      {mis.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center gap-2">
            <Recycle size={16} className="text-primary" />
            <h3 className="text-sm font-bold text-gray-800 dark:text-white">Mis reciclajes</h3>
          </div>
          <div className="divide-y divide-gray-50 dark:divide-gray-700">
            {mis.map(r => {
              const cfg = ESTADO_CONFIG[r.estado] ?? ESTADO_CONFIG.pendiente
              const Icon = cfg.icon
              return (
                <div key={r.id} className="flex items-center gap-3 px-5 py-3">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${cfg.bg}`}>
                    <Icon size={15} className={cfg.color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-800 dark:text-gray-100 truncate">{r.centroNombre}</p>
                    <p className="text-xs text-gray-400">{r.kg} kg · {timeAgo(r.fecha)}</p>
                  </div>
                  <div className="text-right shrink-0">
                    {r.estado === 'aprobado' && r.codigo ? (
                      <div className="text-right">
                        <p className="text-xs font-bold text-green-600 tracking-widest font-mono">{r.codigo}</p>
                        <p className="text-xs text-gray-400">código</p>
                      </div>
                    ) : (
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.color}`}>
                        {cfg.label}
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Contadores comunidad ── */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <Users size={16} className="text-primary shrink-0" />
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Recicladores</span>
          </div>
          <p className="text-2xl font-black text-gray-900 dark:text-white">{totalPersonas}</p>
          <p className="text-xs text-gray-400 mt-0.5">personas en Monterrey</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <Recycle size={16} className="text-green-600 shrink-0" />
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Total reciclado</span>
          </div>
          <p className="text-2xl font-black text-gray-900 dark:text-white">{totalKgGlobal} <span className="text-base font-semibold text-gray-400">kg</span></p>
          <p className="text-xs text-gray-400 mt-0.5">de Tetrapak evitado</p>
        </div>
      </div>

      {/* ── Leaderboard ── */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center gap-2">
          <Trophy size={16} className="text-amber-500" />
          <h3 className="text-sm font-bold text-gray-800 dark:text-white">Tabla de honor</h3>
        </div>

        {leaderboard.length === 0 ? (
          <div className="py-12 text-center">
            <img src={tetrapakIconImg} alt="reciclaje" className="w-12 h-12 object-contain mx-auto mb-2" />
            <p className="text-sm text-gray-500 dark:text-gray-400">Aún no hay reciclajes aprobados.</p>
            <p className="text-xs text-gray-400 mt-1">¡Tú puedes ser el primero!</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50 dark:divide-gray-700">
            {leaderboard.map((r, i) => (
              <div key={r.nombre} className={`flex items-center gap-3 px-5 py-3.5 ${i < 3 ? 'bg-gradient-to-r from-amber-50/60 to-transparent dark:from-amber-900/10' : ''}`}>
                {/* Rank */}
                <div className="w-7 flex items-center justify-center shrink-0">
                  {i < 3
                    ? <img src={MEDAL_IMGS[i]} alt={`#${i+1}`} className="w-7 h-7 object-contain" />
                    : <span className="text-sm font-bold text-gray-400">#{i + 1}</span>
                  }
                </div>

                {/* Avatar */}
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 ${
                  i === 0 ? 'bg-amber-100 text-amber-700' :
                  i === 1 ? 'bg-gray-200 text-gray-600' :
                  i === 2 ? 'bg-orange-100 text-orange-700' :
                  'bg-green-50 text-green-700'
                }`}>
                  {r.nombre.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">{r.nombre}</p>
                  <p className="text-xs text-gray-400 truncate">{r.ultimoCentro || 'Centro no especificado'}</p>
                </div>

                {/* Stats */}
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold text-gray-900 dark:text-white">{r.totalKg} kg</p>
                  <p className="text-xs text-gray-400">{r.visitas} {r.visitas === 1 ? 'visita' : 'visitas'}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Actividad reciente ── */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center gap-2">
          <Clock size={16} className="text-primary" />
          <h3 className="text-sm font-bold text-gray-800 dark:text-white">Actividad reciente</h3>
        </div>

        {recent.length === 0 ? (
          <div className="py-8 text-center text-sm text-gray-400">Sin actividad reciente</div>
        ) : (
          <div className="divide-y divide-gray-50 dark:divide-gray-700">
            {recent.map(r => (
              <div key={r.id} className="flex items-center gap-3 px-5 py-3">
                <div className="w-8 h-8 bg-green-50 dark:bg-green-900/20 rounded-xl flex items-center justify-center shrink-0">
                  <Recycle size={14} className="text-green-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-700 dark:text-gray-200">
                    <span className="font-semibold">{r.nombre}</span>
                    {' '}recicló en{' '}
                    <span className="font-medium text-primary">{r.centroNombre}</span>
                  </p>
                  <p className="text-xs text-gray-400">{r.kg} kg · {timeAgo(r.fecha)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
