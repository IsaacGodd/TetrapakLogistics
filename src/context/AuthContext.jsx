import { createContext, useContext, useState, useEffect } from 'react'
import { users } from '../data/mockData'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = sessionStorage.getItem('tl_user')
    return saved ? JSON.parse(saved) : null
  })

  const login = (username, password) => {
    const found = users.find(
      u => u.username === username && u.password === password
    )
    if (found) {
      const { password: _pw, ...safeUser } = found
      setUser(safeUser)
      sessionStorage.setItem('tl_user', JSON.stringify(safeUser))
      return { success: true, user: safeUser }
    }
    return { success: false, error: 'Usuario o contraseña incorrectos' }
  }

  const loginAsGuest = () => {
    const guest = { id: 0, username: 'invitado', role: 'invitado', name: 'Invitado' }
    setUser(guest)
    sessionStorage.setItem('tl_user', JSON.stringify(guest))
  }

  const logout = () => {
    setUser(null)
    sessionStorage.removeItem('tl_user')
  }

  return (
    <AuthContext.Provider value={{ user, login, loginAsGuest, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
