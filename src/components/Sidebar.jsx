import { NavLink, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useState } from 'react'
import {
  LayoutDashboard, Map, HelpCircle, History, MapPin, LogOut, Menu, X, Upload, Trophy
} from 'lucide-react'
import logoImg from '../images/WhatsApp_Image_2026-03-10_at_9.19.57_AM-removebg-preview.png'

// Per-path brand colors for active state (dark mode only)
const navColors = {
  '/dashboard': { bg: 'bg-gradient-to-r from-blue-100 via-teal-50 to-green-100 dark:from-slate-800 dark:via-slate-800 dark:to-slate-700', text: 'text-blue-700', border: 'border-l-blue-600' },
  '/mapa-transportistas': { bg: 'bg-gradient-to-r from-teal-100 to-blue-50 dark:from-slate-800 dark:via-slate-800 dark:to-slate-700', text: 'text-teal-700', border: 'border-l-teal-600' },
  '/que-hacer': { bg: 'bg-gradient-to-r from-green-100 to-teal-50 dark:from-slate-800 dark:via-slate-800 dark:to-slate-700', text: 'text-green-700', border: 'border-l-green-600' },
  '/historia': { bg: 'bg-gradient-to-r from-blue-50 to-green-100 dark:from-slate-800 dark:via-slate-800 dark:to-slate-700', text: 'text-blue-700', border: 'border-l-blue-600' },
  '/centros-acopio': { bg: 'bg-gradient-to-r from-teal-50 to-green-100 dark:from-slate-800 dark:via-slate-800 dark:to-slate-700', text: 'text-teal-700', border: 'border-l-teal-600' },
  '/importar':  { bg: 'bg-gradient-to-r from-blue-100 to-teal-100 dark:from-slate-800 dark:via-slate-800 dark:to-slate-700', text: 'text-blue-700', border: 'border-l-blue-600' },
  '/comunidad': { bg: 'bg-gradient-to-r from-green-100 to-emerald-50 dark:from-slate-800 dark:via-slate-800 dark:to-slate-700', text: 'text-green-700', border: 'border-l-green-600' },
}

const navItems = [
  { path: '/dashboard', label: 'Dashboard', roles: ['admin', 'employee', 'tester'], Icon: LayoutDashboard },
  { path: '/mapa-transportistas', label: 'Mapa Transportistas', roles: ['admin', 'employee', 'transportista', 'tester'], Icon: Map },
  { path: '/que-hacer', label: '¿Qué hacer con Tetrapak?', roles: ['admin', 'employee', 'transportista', 'invitado', 'tester'], Icon: HelpCircle },
  { path: '/historia', label: 'Historia', roles: ['admin', 'employee', 'transportista', 'invitado', 'tester'], Icon: History },
  { path: '/centros-acopio', label: 'Centros de Acopio', roles: ['admin', 'employee', 'transportista', 'invitado', 'tester'], Icon: MapPin },
  { path: '/comunidad', label: 'Comunidad', roles: ['admin', 'employee', 'transportista', 'invitado', 'tester'], Icon: Trophy },
  { path: '/importar', label: 'Importar Datos', roles: ['admin', 'employee', 'tester'], Icon: Upload },
]

export default function Sidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  const visibleItems = navItems.filter(item => item.roles.includes(user?.role))

  const handleLogout = () => { logout(); navigate('/login') }

  const Content = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 py-6 border-b border-gray-100 dark:border-gray-800">
        <Link to="/dashboard" className="flex items-center gap-3 group">
          <img
            src={logoImg}
            alt="Logo"
            className="w-[52px] h-[52px] object-contain shrink-0 transition-transform group-hover:scale-105"
          />
          <div className="leading-tight">
            <div className="font-extrabold text-primary text-base tracking-tight">Tetrapak</div>
            <div className="font-extrabold text-teal-600 text-base -mt-0.5 tracking-tight">Logistics</div>
            <div className="text-xs text-gray-400 dark:text-gray-500 font-medium mt-0.5">SEDUSO</div>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {visibleItems.map(({ path, label, Icon }) => {
          const colors = navColors[path] || { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-l-blue-600' }
          return (
            <NavLink
              key={path}
              to={path}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 border-l-2 ${isActive
                  ? `${colors.bg} ${colors.text} border-l-2 ${colors.border} shadow-sm`
                  : 'text-gray-500 dark:text-gray-400 hover:bg-gradient-to-r hover:from-blue-50 hover:to-teal-50 dark:hover:bg-gray-800 dark:hover:bg-none hover:text-teal-700 dark:hover:text-gray-200 border-transparent'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={17} strokeWidth={isActive ? 2.2 : 1.8} className="shrink-0 transition-all duration-200" />
                  <span className="leading-tight">{label}</span>
                </>
              )}
            </NavLink>
          )
        })}
      </nav>

      {/* User info */}
      {user && (
        <div className="px-4 py-3 mx-3 mb-2 bg-gradient-to-r from-blue-50 via-teal-50 to-green-50 dark:bg-gray-800 dark:bg-none rounded-xl border border-blue-100 dark:border-gray-700">
          <p className="text-xs font-semibold text-gray-700 dark:text-gray-200 truncate">{user.name}</p>
          <p className="text-xs text-gray-400 dark:text-gray-500 capitalize">{user.role}</p>
        </div>
      )}

      {/* Logout */}
      <div className="px-3 py-4 border-t border-gray-100 dark:border-gray-800">
        <button
          onClick={handleLogout}
          className="group flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-gradient-to-r hover:from-red-50 hover:to-orange-50 dark:hover:bg-red-900/20 dark:hover:bg-none hover:text-red-600 transition-all duration-200 active:scale-95"
        >
          <LogOut size={17} strokeWidth={1.8} className="shrink-0" />
          Cerrar Sesión
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile toggle */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md border border-gray-100 transition-all duration-200 active:scale-95"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X size={18} /> : <Menu size={18} />}
      </button>

      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/30 z-40 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
      )}

      {/* Desktop */}
      <aside className="hidden lg:flex flex-col w-56 bg-gradient-to-b from-[#f4faff] via-[#eef9f6] to-[#f2f9ef] dark:bg-gray-900 dark:bg-none border-r border-gray-100 dark:border-gray-800 h-screen sticky top-0 shrink-0 shadow-sm">
        <Content />
      </aside>

      {/* Mobile drawer */}
      <aside className={`lg:hidden fixed left-0 top-0 h-full w-56 bg-gradient-to-b from-[#f4faff] via-[#eef9f6] to-[#f2f9ef] dark:bg-gray-900 dark:bg-none border-r border-gray-100 dark:border-gray-800 z-50 shadow-xl transition-transform duration-300 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <Content />
      </aside>
    </>
  )
}
