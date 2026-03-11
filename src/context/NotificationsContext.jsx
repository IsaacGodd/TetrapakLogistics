import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useAuth } from './AuthContext'
import { api } from '../utils/api'
import { useRecycling } from './RecyclingContext'

const NotificationsContext = createContext(null)

export function NotificationsProvider({ children }) {
  const { user } = useAuth()
  const { fetchAll: refreshRecycling } = useRecycling()
  const [pending, setPending] = useState([])
  const [loading, setLoading] = useState(false)

  const canSee = user && ['admin', 'employee'].includes(user.role)

  const fetchPending = useCallback(async () => {
    if (!canSee) return
    setLoading(true)
    try {
      const data = await api.get('/api/reciclajes/pendientes')
      setPending(Array.isArray(data) ? data : [])
    } catch {
      // silently fail
    } finally {
      setLoading(false)
    }
  }, [canSee])

  useEffect(() => {
    if (!canSee) { setPending([]); return }
    fetchPending()
    const interval = setInterval(fetchPending, 30000)
    return () => clearInterval(interval)
  }, [fetchPending, canSee])

  const approve = useCallback(async (id) => {
    await api.patch(`/api/reciclajes/${id}/aprobar`)
    fetchPending()
    refreshRecycling?.()
  }, [fetchPending, refreshRecycling])

  const reject = useCallback(async (id) => {
    await api.patch(`/api/reciclajes/${id}/rechazar`)
    fetchPending()
    refreshRecycling?.()
  }, [fetchPending, refreshRecycling])

  return (
    <NotificationsContext.Provider value={{ pending, pendingCount: pending.length, loading, fetchPending, approve, reject }}>
      {children}
    </NotificationsContext.Provider>
  )
}

export function useNotifications() {
  return useContext(NotificationsContext)
}
