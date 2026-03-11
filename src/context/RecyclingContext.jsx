import { createContext, useContext, useState, useEffect, useCallback } from 'react'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

const RecyclingContext = createContext(null)

function getDeviceId() {
  let id = localStorage.getItem('tl_device_id')
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem('tl_device_id', id)
  }
  return id
}

export function RecyclingProvider({ children }) {
  const [leaderboard, setLeaderboard]       = useState([])
  const [topRecyclerMonth, setTopMonth]     = useState(null)
  const [recent, setRecent]                 = useState([])
  const [loading, setLoading]               = useState(true)

  const fetchAll = useCallback(async () => {
    try {
      const [lb, top, rec] = await Promise.all([
        fetch(`${BASE_URL}/api/reciclajes/leaderboard`).then(r => r.json()),
        fetch(`${BASE_URL}/api/reciclajes/top-month`).then(r => r.json()),
        fetch(`${BASE_URL}/api/reciclajes/recent`).then(r => r.json()),
      ])
      setLeaderboard(Array.isArray(lb) ? lb : [])
      setTopMonth(top ?? null)
      setRecent(Array.isArray(rec) ? rec : [])
    } catch {
      // silently fail — community features are non-critical
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  const registerRecycling = useCallback(async (nombre, centroNombre) => {
    const deviceId = getDeviceId()
    const res = await fetch(`${BASE_URL}/api/reciclajes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre, deviceId, centroNombre }),
    })
    if (!res.ok) throw new Error('Error al registrar reciclaje')
    const data = await res.json()
    // Refresh community data after registering
    fetchAll()
    return data // { reciclaje, impacto }
  }, [fetchAll])

  return (
    <RecyclingContext.Provider value={{ leaderboard, topRecyclerMonth, recent, loading, registerRecycling }}>
      {children}
    </RecyclingContext.Provider>
  )
}

export function useRecycling() {
  return useContext(RecyclingContext)
}
