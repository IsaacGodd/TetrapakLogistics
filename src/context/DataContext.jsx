import { createContext, useContext, useState } from 'react'

const DataContext = createContext(null)

const STORAGE_KEY = 'tl_data'

const emptyState = { centros: [], viajes: [] }

export function DataProvider({ children }) {
  const [data, setData] = useState(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY)
      return saved ? JSON.parse(saved) : emptyState
    } catch {
      return emptyState
    }
  })

  // Replace all data for a given entity
  const importData = (entity, rows) => {
    setData(prev => {
      const next = { ...prev, [entity]: rows }
      try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next)) } catch {}
      return next
    })
  }

  // Clear one entity back to empty
  const clearEntity = (entity) => {
    setData(prev => {
      const next = { ...prev, [entity]: [] }
      try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next)) } catch {}
      return next
    })
  }

  return (
    <DataContext.Provider value={{ ...data, importData, clearEntity }}>
      {children}
    </DataContext.Provider>
  )
}

export function useData() {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useData must be used inside DataProvider')
  return ctx
}
