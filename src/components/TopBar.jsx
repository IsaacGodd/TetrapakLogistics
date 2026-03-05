import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { Sun, Moon } from 'lucide-react'

export default function TopBar() {
  const { user } = useAuth()
  const { dark, toggle } = useTheme()

  const initials = user?.name
    ?.split(' ').map(n => n[0]).slice(0, 2).join('')
    .toUpperCase() ?? '?'

  return (
    <div className={`h-12 bg-white flex items-center justify-end px-5 gap-2 shrink-0 ${
      dark ? 'dark:bg-gray-900 border-b border-gray-800' : 'border-b border-gray-100'
    }`}>

      {/* Theme toggle */}
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

      {/* Profile link */}
      <NavLink
        to="/perfil"
        className={({ isActive }) =>
          `flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-sm font-medium transition-all active:scale-95 ${
            isActive
              ? 'bg-gray-100 dark:bg-violet-900/30 text-gray-800 dark:text-violet-400'
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
          }`
        }
      >
        {/* Avatar: gray in light mode, gradient in dark mode */}
        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
          dark
            ? 'bg-gradient-to-br from-primary to-teal-500 text-white'
            : 'bg-gray-200 text-gray-600'
        }`}>
          {initials}
        </div>
        <span className="hidden sm:block text-sm font-medium">Perfil</span>
      </NavLink>
    </div>
  )
}
