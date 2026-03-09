import { createContext, useContext, useState, useEffect } from 'react'
import { demoCentros } from '../data/demoCentros'
import { centrosApi, viajesApi } from '../utils/api'

const DataContext = createContext(null)

const STORAGE_KEY = 'tl_data'
const USE_REAL_API = Boolean(import.meta.env.VITE_API_URL)

const defaultState = { centros: demoCentros, viajes: [] }

export function DataProvider({ children }) {
  const [data, setData] = useState(() => {
    if (USE_REAL_API) return defaultState // API takes over; skip sessionStorage
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (!parsed.centros || parsed.centros.length === 0) {
          return { ...parsed, centros: demoCentros }
        }
        return parsed
      }
      return defaultState
    } catch {
      return defaultState
    }
  })

  const [loading, setLoading] = useState(USE_REAL_API)
  const [apiError, setApiError] = useState(null)

  // ── Load from real API on mount ──────────────────────────────────────────
  useEffect(() => {
    if (!USE_REAL_API) return

    async function fetchAll() {
      try {
        const [centros, viajes] = await Promise.all([
          centrosApi.getAll(),
          viajesApi.getAll({ limit: 100 }).catch(() => []),
        ])
        setData({ centros, viajes })
      } catch (err) {
        console.warn('API no disponible, usando datos demo:', err.message)
        setApiError(err.message)
        // Fallback gracioso a datos demo
        setData(defaultState)
      } finally {
        setLoading(false)
      }
    }

    fetchAll()
  }, [])

  // ── Persist to sessionStorage (solo modo mock) ────────────────────────────
  function persist(next) {
    if (!USE_REAL_API) {
      try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next)) } catch {}
    }
  }

  // Replace all data for a given entity (CSV import or API refresh)
  const importData = (entity, rows) => {
    setData(prev => {
      const next = { ...prev, [entity]: rows }
      persist(next)
      return next
    })
  }

  // Clear one entity back to empty
  const clearEntity = (entity) => {
    setData(prev => {
      const next = { ...prev, [entity]: entity === 'centros' ? demoCentros : [] }
      persist(next)
      return next
    })
  }

  // Refresh centros from API (llamar después de crear/editar un centro)
  const refreshCentros = async () => {
    if (!USE_REAL_API) return
    try {
      const centros = await centrosApi.getAll()
      setData(prev => ({ ...prev, centros }))
    } catch {}
  }

  return (
    <DataContext.Provider value={{
      ...data,
      loading,
      apiError,
      importData,
      clearEntity,
      refreshCentros,
      useRealApi: USE_REAL_API,
    }}>
      {children}
    </DataContext.Provider>
  )
}

export function useData() {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useData must be used inside DataProvider')
  return ctx
}
