import { useState } from 'react'
import ImportModule from '../components/ImportModule'
import { useData } from '../context/DataContext'
import { CheckCircle, X } from 'lucide-react'

export default function ImportarDatos() {
  const { importData } = useData()
  const [toast, setToast] = useState(null)

  const handleImport = (entity, data) => {
    // Entidades que se guardan en DataContext (centros y viajes)
    if (entity === 'centros' || entity === 'viajes') {
      importData(entity, data)
    }
    // TODO (backend): POST /api/import/:entity con data
    console.log(`[Import] ${entity} — ${data.length} registros`, data)
    setToast({ entity, count: data.length })
    setTimeout(() => setToast(null), 4000)
  }

  return (
    <div className="relative min-h-full bg-gray-50">
      <ImportModule onImport={handleImport} />

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-gray-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl anim-fade-up">
          <CheckCircle size={18} className="text-green-400 shrink-0" strokeWidth={2} />
          <span className="text-sm font-medium">
            {toast.count} registros de <strong>{toast.entity}</strong> importados
          </span>
          <button onClick={() => setToast(null)} className="ml-1 text-gray-400 hover:text-white transition-colors">
            <X size={14} strokeWidth={2} />
          </button>
        </div>
      )}
    </div>
  )
}
