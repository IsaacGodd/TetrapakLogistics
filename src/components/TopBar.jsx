import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { useRecycling } from '../context/RecyclingContext'
import { useNotifications } from '../context/NotificationsContext'
import { Sun, Moon, Bell, Check, X, Recycle } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'

function timeAgoShort(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins  = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days  = Math.floor(diff / 86400000)
  if (mins < 2)   return 'ahora'
  if (mins < 60)  return `${mins}m`
  if (hours < 24) return `${hours}h`
  return `${days}d`
}

export default function TopBar() {
  const { user } = useAuth()
  const { dark, toggle } = useTheme()
  const { topRecyclerMonth } = useRecycling()
  const { pending, pendingCount, approve, reject } = useNotifications()
  const [notifOpen, setNotifOpen] = useState(false)
  const [actionLoading, setActionLoading] = useState(null)
  const panelRef = useRef(null)

  const canSeeNotifs = user && ['admin', 'employee'].includes(user.role)

  const initials = user?.name
    ?.split(' ').map(n => n[0]).slice(0, 2).join('')
    .toUpperCase() ?? '?'

  // Close panel when clicking outside
  useEffect(() => {
    if (!notifOpen) return
    function handleClick(e) {
      if (!panelRef.current?.contains(e.target)) setNotifOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [notifOpen])

  async function handleApprove(id) {
    setActionLoading(id + '_a')
    try { await approve(id) } finally { setActionLoading(null) }
  }

  async function handleReject(id) {
    setActionLoading(id + '_r')
    try { await reject(id) } finally { setActionLoading(null) }
  }

  return (
    <div className={`h-12 bg-gradient-to-r from-blue-50/80 via-teal-50/70 to-green-50/80 backdrop-blur-sm flex items-center justify-between px-5 gap-2 shrink-0 ${dark ? 'dark:bg-gray-900 dark:bg-none border-b border-gray-800' : 'border-b border-gray-100'
      }`}>

      {/* Top recycler banner */}
      {topRecyclerMonth ? (
        <NavLink
          to="/comunidad"
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-green-100 dark:bg-green-900/30 hover:bg-green-200 dark:hover:bg-green-900/50 transition-all active:scale-95 shrink-0 min-w-0"
        >
          <span className="text-sm">🏆</span>
          <span className="text-xs font-semibold text-green-800 dark:text-green-300 truncate max-w-[140px] sm:max-w-none">
            {topRecyclerMonth.nombre}
          </span>
          <span className="text-xs text-green-600 dark:text-green-400 hidden sm:inline whitespace-nowrap">
            · {topRecyclerMonth.totalKg} kg este mes
          </span>
        </NavLink>
      ) : (
        <div />
      )}

      {/* Right controls */}
      <div className="flex items-center gap-2 shrink-0">

        {/* Notifications bell — admin/employee only */}
        {canSeeNotifs && (
          <div className="relative" ref={panelRef}>
            <button
              onClick={() => setNotifOpen(o => !o)}
              title="Solicitudes de reciclaje"
              className="relative w-8 h-8 rounded-xl flex items-center justify-center text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-all active:scale-90"
            >
              <Bell size={16} strokeWidth={2} />
              {pendingCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
                  {pendingCount > 9 ? '9+' : pendingCount}
                </span>
              )}
            </button>

            {notifOpen && (
              <div className="absolute right-0 top-10 z-50 w-80 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 flex items-center gap-2">
                  <Recycle size={14} className="text-green-600" />
                  <span className="text-sm font-bold text-gray-800 dark:text-white">Solicitudes de reciclaje</span>
                  {pendingCount > 0 && (
                    <span className="ml-auto text-xs font-semibold bg-red-100 text-red-600 px-2 py-0.5 rounded-full">{pendingCount}</span>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto">
                  {pending.length === 0 ? (
                    <div className="py-8 text-center">
                      <p className="text-2xl mb-1">✅</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Sin solicitudes pendientes</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-50 dark:divide-gray-800">
                      {pending.map(r => (
                        <div key={r.id} className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                          <div className="flex items-start gap-2 mb-2">
                            <div className="w-7 h-7 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold text-green-700 dark:text-green-400">
                              {r.nombre.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 truncate">{r.nombre}</p>
                              <p className="text-xs text-gray-400 truncate">{r.centroNombre}</p>
                            </div>
                            <div className="text-right shrink-0">
                              <p className="text-xs font-bold text-gray-700 dark:text-gray-300">{r.kg} kg</p>
                              <p className="text-xs text-gray-400">{timeAgoShort(r.fecha)}</p>
                            </div>
                          </div>
                          <div className="flex gap-1.5">
                            <button
                              onClick={() => handleApprove(r.id)}
                              disabled={actionLoading !== null}
                              className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-semibold bg-green-600 hover:bg-green-700 text-white disabled:opacity-50 transition-all active:scale-95"
                            >
                              {actionLoading === r.id + '_a' ? '...' : <><Check size={11} /> Aprobar</>}
                            </button>
                            <button
                              onClick={() => handleReject(r.id)}
                              disabled={actionLoading !== null}
                              className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-semibold bg-red-50 hover:bg-red-100 text-red-600 disabled:opacity-50 transition-all active:scale-95"
                            >
                              {actionLoading === r.id + '_r' ? '...' : <><X size={11} /> Rechazar</>}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        <button
          onClick={toggle}
          title={dark ? 'Modo claro' : 'Modo oscuro'}
          className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-all active:scale-90"
        >
          {dark
            ? <Sun size={16} strokeWidth={2} />
            : <Moon size={16} strokeWidth={2} />
          }
        </button>

        <NavLink
          to="/perfil"
          className={({ isActive }) =>
            `flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-sm font-medium transition-all active:scale-95 ${isActive
              ? 'bg-gray-100 dark:bg-violet-900/30 text-gray-800 dark:text-violet-400'
              : 'text-gray-700 dark:text-gray-300 hover:bg-blue-100 dark:hover:bg-gray-800'
            }`
          }
        >
          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${dark
            ? 'bg-gradient-to-br from-primary to-teal-500 text-white'
            : 'bg-gray-200 text-gray-600'
            }`}>
            {initials}
          </div>
          <span className="hidden sm:block text-sm font-medium">Perfil</span>
        </NavLink>
      </div>
    </div>
  )
}
