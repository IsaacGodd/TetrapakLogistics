import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { useRecycling } from '../context/RecyclingContext'
import { Sun, Moon } from 'lucide-react'

export default function TopBar() {
  const { user } = useAuth()
  const { dark, toggle } = useTheme()
  const { topRecyclerMonth } = useRecycling()

  const initials = user?.name
    ?.split(' ').map(n => n[0]).slice(0, 2).join('')
    .toUpperCase() ?? '?'

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
