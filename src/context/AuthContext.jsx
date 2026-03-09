import { createContext, useContext, useState } from 'react'
import { users } from '../data/mockData'
import { authApi } from '../utils/api'

const AuthContext = createContext(null)

// Si VITE_API_URL está definido en .env, usamos el backend real; si no, mock local.
const USE_REAL_API = Boolean(import.meta.env.VITE_API_URL)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = sessionStorage.getItem('tl_user')
    return saved ? JSON.parse(saved) : null
  })

  function persistUser(u) {
    setUser(u)
    sessionStorage.setItem('tl_user', JSON.stringify(u))
  }

  // ── Login con backend real (JWT) ─────────────────────────────────────────
  async function loginWithApi(email, password) {
    try {
      const { token, user: u } = await authApi.login(email, password)
      sessionStorage.setItem('tl_token', token)
      // Normaliza campos para que el frontend los use igual que antes
      const safeUser = {
        id: u.id,
        username: u.email,
        name: u.nombre,
        role: u.role,
        email: u.email,
        avatar: u.avatar || null,
      }
      persistUser(safeUser)
      return { success: true, user: safeUser }
    } catch (err) {
      return { success: false, error: err.message || 'Error al iniciar sesión' }
    }
  }

  // ── Login con mock data (sin backend) ────────────────────────────────────
  function loginWithMock(username, password) {
    const found = users.find(u => u.username === username && u.password === password)
    if (found) {
      const { password: _pw, ...safeUser } = found
      persistUser(safeUser)
      return { success: true, user: safeUser }
    }
    return { success: false, error: 'Usuario o contraseña incorrectos' }
  }

  const login = USE_REAL_API ? loginWithApi : loginWithMock

  const loginAsGuest = () => {
    const guest = { id: 0, username: 'invitado', role: 'invitado', name: 'Invitado' }
    persistUser(guest)
  }

  const logout = () => {
    setUser(null)
    sessionStorage.removeItem('tl_user')
    sessionStorage.removeItem('tl_token')
  }

  return (
    <AuthContext.Provider value={{ user, login, loginAsGuest, logout, useRealApi: USE_REAL_API }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
