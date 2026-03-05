import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { User, Lock, ArrowRight, Loader2 } from 'lucide-react'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const { login, loginAsGuest } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    setTimeout(() => {
      const result = login(username, password)
      setLoading(false)
      if (result.success) {
        const r = result.user.role
        navigate(['admin', 'employee', 'tester'].includes(r) ? '/dashboard' : '/que-hacer')
      } else {
        setError(result.error)
      }
    }, 400)
  }

  const handleGuest = () => { loginAsGuest(); navigate('/que-hacer') }

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #1a3a5c 0%, #1D4ED8 30%, #0d9488 65%, #166534 100%)' }}
    >
      {/* Background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-32 w-80 h-80 rounded-full opacity-25" style={{ background: 'radial-gradient(circle, #60a5fa, transparent)' }} />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full opacity-20" style={{ background: 'radial-gradient(circle, #34d399, transparent)' }} />
        <div className="absolute top-1/2 left-1/4 w-48 h-48 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #fbbf24, transparent)' }} />
      </div>

      {/* Card */}
      <div className="relative z-10 flex w-full max-w-xl mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden"
        style={{ boxShadow: '0 25px 60px rgba(0,0,0,0.3)' }}>

        {/* Left — Form */}
        <div className="flex-1 px-8 py-10 sm:px-10">
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Bienvenido</h1>
          <p className="text-sm text-gray-400 mt-1 mb-8">Sistema de Logística y Centros de Acopio</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Usuario</label>
              <div className="relative">
                <User size={15} strokeWidth={1.8} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="Ingrese su usuario"
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Contraseña</label>
              <div className="relative">
                <Lock size={15} strokeWidth={1.8} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="text-xs text-red-600 bg-red-50 border border-red-100 px-3 py-2.5 rounded-xl">{error}</div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-primary text-white rounded-xl font-semibold text-sm hover:bg-blue-700 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 shadow-sm disabled:opacity-60 mt-2"
            >
              {loading
                ? <Loader2 size={16} className="animate-spin" />
                : <> Iniciar Sesión <ArrowRight size={15} strokeWidth={2.5} /></>
              }
            </button>
          </form>

          <div className="relative my-5 flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-100" />
            <span className="text-xs text-gray-400 shrink-0">o continúa como</span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          <button
            onClick={handleGuest}
            className="w-full py-3 border border-gray-200 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-50 hover:border-gray-300 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2"
          >
            <User size={15} strokeWidth={1.8} className="text-gray-400" />
            Acceso Invitado
          </button>

          {/* Test hint */}
          <div className="mt-6 p-3 bg-gray-50 rounded-xl text-xs text-gray-400 space-y-0.5">
            <p className="font-semibold text-gray-500 mb-1">Cuentas de prueba:</p>
            <p>admin / admin123 &nbsp;·&nbsp; empleado / empleado123</p>
            <p>transportista / trans123 &nbsp;·&nbsp; tester / tester123</p>
          </div>
        </div>

        {/* Right — Hero */}
        <div className="hidden sm:flex flex-col justify-between w-56 p-8 text-white relative overflow-hidden shrink-0"
          style={{ background: 'linear-gradient(145deg, #1D6ADE 0%, #0d9488 100%)' }}
        >
          {/* Dot grid overlay */}
          <div className="absolute inset-0 opacity-10"
            style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)', backgroundSize: '20px 20px' }} />

          <div className="relative z-10">
            <div className="text-4xl mb-5 font-bold leading-none">♻</div>
            <h2 className="text-xl font-bold leading-snug">Optimización Logística Inteligente</h2>
            <p className="text-xs text-blue-100 mt-3 leading-relaxed opacity-90">
              Gestione rutas, monitoree centros de acopio y analice el rendimiento de su flota en tiempo real.
            </p>
          </div>

          <div className="relative z-10 space-y-3">
            <div className="rounded-xl p-3.5 backdrop-blur-sm" style={{ background: 'rgba(255,255,255,0.15)' }}>
              <div className="text-2xl font-bold">+150</div>
              <div className="text-xs text-blue-100 mt-0.5">Centros de Acopio</div>
            </div>
            <div className="rounded-xl p-3.5 backdrop-blur-sm" style={{ background: 'rgba(255,255,255,0.15)' }}>
              <div className="text-2xl font-bold">98%</div>
              <div className="text-xs text-blue-100 mt-0.5">Eficiencia en Rutas</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
