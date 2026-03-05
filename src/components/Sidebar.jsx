import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useState } from 'react'
import {
  LayoutDashboard, Map, HelpCircle, History, MapPin, LogOut, Menu, X
} from 'lucide-react'

const navItems = [
  { path: '/dashboard',           label: 'Dashboard',                roles: ['admin','employee'],                              Icon: LayoutDashboard },
  { path: '/mapa-transportistas', label: 'Mapa Transportistas',       roles: ['admin','employee','transportista'],               Icon: Map             },
  { path: '/que-hacer',           label: '¿Qué hacer con Tetrapak?',  roles: ['admin','employee','transportista','invitado'],    Icon: HelpCircle      },
  { path: '/historia',            label: 'Historia',                  roles: ['admin','employee','transportista','invitado'],    Icon: History         },
  { path: '/centros-acopio',      label: 'Centros de Acopio',         roles: ['admin','employee','transportista','invitado'],    Icon: MapPin          },
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
      <div className="px-4 py-5 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-base shrink-0 shadow-sm"
            style={{ background: 'linear-gradient(135deg, #1D6ADE, #16a085)' }}>
            T
          </div>
          <div className="leading-tight">
            <div className="font-bold text-primary text-sm">Tetrapak</div>
            <div className="font-bold text-teal-600 text-sm -mt-0.5">Logistics</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {visibleItems.map(({ path, label, Icon }) => (
          <NavLink
            key={path}
            to={path}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-blue-50 text-primary shadow-sm'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
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
        ))}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-gray-100">
        <button
          onClick={handleLogout}
          className="group flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 hover:text-red-600 transition-all duration-200 active:scale-95"
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
      <aside className="hidden lg:flex flex-col w-52 bg-white border-r border-gray-100 h-screen sticky top-0 shrink-0 shadow-sm">
        <Content />
      </aside>

      {/* Mobile drawer */}
      <aside className={`lg:hidden fixed left-0 top-0 h-full w-56 bg-white border-r border-gray-100 z-50 shadow-xl transition-transform duration-300 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <Content />
      </aside>
    </>
  )
}
