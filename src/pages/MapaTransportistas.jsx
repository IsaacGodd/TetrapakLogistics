import { useState, useMemo } from 'react'
import { Truck, Calendar, ChevronDown, Plus, Check, Download } from 'lucide-react'
import MockMap from '../components/MockMap'
import { diasSemana, materialesLista } from '../data/mockData'
import { useData } from '../context/DataContext'

export default function MapaTransportistas() {
  const { centros } = useData()
  const [selectedDia, setSelectedDia] = useState('Lun')
  const [materialFiltro, setMaterialFiltro] = useState('Todos los materiales')
  const [tetrapakFiltro, setTetrapakFiltro] = useState('todos') // 'todos' | 'si' | 'no'
  const [selectedCentro, setSelectedCentro] = useState(null)
  const [addedRoutes, setAddedRoutes] = useState([])

  const filteredCentros = useMemo(() => {
    return centros.filter(c => {
      const diasOk = c.dias.includes(selectedDia)
      const materialOk = materialFiltro === 'Todos los materiales' ? true : c.materiales.includes(materialFiltro)
      const tetrapakOk = tetrapakFiltro === 'todos' ? true : tetrapakFiltro === 'si' ? c.tetrapak : !c.tetrapak
      return diasOk && materialOk && tetrapakOk
    })
  }, [selectedDia, materialFiltro, tetrapakFiltro])

  const movilesDia = filteredCentros.filter(c => c.tetrapak).length

  const toggleRoute = (centro) => {
    setAddedRoutes(prev =>
      prev.includes(centro.id) ? prev.filter(id => id !== centro.id) : [...prev, centro.id]
    )
  }

  const diasRows = [diasSemana.slice(0, 4), diasSemana.slice(4)]

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Left Panel */}
      <div className="w-72 shrink-0 bg-white border-r border-gray-100 flex flex-col overflow-hidden shadow-sm">

        {/* Panel Header */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center shrink-0">
              <Truck size={14} strokeWidth={2} className="text-white" />
            </div>
            <h2 className="font-semibold text-sm text-gray-800">Ruta de Transporte</h2>
          </div>

          {/* Day selector */}
          <div className="bg-gray-50 rounded-xl p-3 mb-3">
            <div className="flex items-center gap-1.5 mb-2.5">
              <Calendar size={13} strokeWidth={2} className="text-gray-400" />
              <span className="text-xs font-semibold text-gray-600">Día de la Semana</span>
            </div>
            <div className="space-y-1.5">
              {diasRows.map((row, ri) => (
                <div key={ri} className="grid grid-cols-4 gap-1">
                  {row.map(dia => (
                    <button
                      key={dia}
                      onClick={() => setSelectedDia(dia)}
                      className={`py-1.5 text-xs rounded-lg font-medium transition-all duration-200 active:scale-95 ${
                        selectedDia === dia
                          ? 'bg-primary text-white shadow-sm'
                          : 'bg-white text-gray-500 hover:bg-gray-100 border border-gray-200'
                      }`}
                    >
                      {dia}
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Mobile count link */}
          <button className="flex items-center gap-1.5 text-xs text-primary hover:underline transition-colors">
            <Truck size={12} strokeWidth={2} />
            {movilesDia} centros móviles disponibles este día
          </button>
        </div>

        {/* Filters */}
        <div className="px-4 py-3 border-b border-gray-100 space-y-3">
          {/* Material filter */}
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Filtrar por Material</label>
            <div className="relative">
              <select
                value={materialFiltro}
                onChange={e => setMaterialFiltro(e.target.value)}
                className="w-full text-xs border border-gray-200 rounded-xl px-3 py-2.5 pr-8 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all appearance-none bg-white cursor-pointer"
              >
                {materialesLista.map(m => <option key={m}>{m}</option>)}
              </select>
              <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Tetrapak toggle */}
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Acepta Tetrapak</label>
            <div className="flex rounded-xl overflow-hidden border border-gray-200 text-xs font-medium">
              {[
                { val: 'todos', label: 'Todos' },
                { val: 'si',    label: '✓ Sí'  },
                { val: 'no',    label: 'No'     },
              ].map(({ val, label }) => (
                <button
                  key={val}
                  onClick={() => setTetrapakFiltro(val)}
                  className={`flex-1 py-2 transition-all duration-200 active:scale-95 ${
                    tetrapakFiltro === val
                      ? val === 'todos' ? 'bg-gray-800 text-white' : val === 'si' ? 'bg-primary text-white' : 'bg-gray-600 text-white'
                      : 'bg-white text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Export */}
          <button className="flex items-center gap-1.5 text-xs text-primary hover:underline transition-colors">
            <Download size={12} strokeWidth={2} />
            Exportar medidas disponibles de esta ruta
          </button>
        </div>

        {/* Centro list */}
        <div className="flex-1 overflow-y-auto p-3">
          <p className="text-xs font-semibold text-gray-500 mb-2 px-1">
            Centros Disponibles ({filteredCentros.length})
          </p>
          <div className="space-y-1.5">
            {filteredCentros.length === 0 && (
              <p className="text-xs text-gray-400 text-center py-8">Sin centros para este filtro</p>
            )}
            {filteredCentros.map(centro => {
              const isSelected = selectedCentro?.id === centro.id
              const isAdded = addedRoutes.includes(centro.id)
              return (
                <div
                  key={centro.id}
                  onClick={() => setSelectedCentro(centro)}
                  className={`group p-3 rounded-xl border cursor-pointer transition-all duration-200 hover:shadow-sm ${
                    isSelected
                      ? 'border-primary/30 bg-blue-50 shadow-sm'
                      : 'border-gray-100 hover:border-gray-200 bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-800 leading-tight">{centro.nombre}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                        <span className="text-xs text-gray-500">{centro.horario}</span>
                      </div>
                      {centro.tetrapak
                        ? <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-600 mt-1">
                            <Check size={10} strokeWidth={3} /> Tetrapak
                          </span>
                        : <span className="text-xs text-gray-400 mt-1 block">Sin Tetrapak</span>
                      }
                      <p className="text-xs text-gray-400 mt-1 truncate">{centro.materiales.join(', ')}</p>
                    </div>
                    <button
                      onClick={e => { e.stopPropagation(); toggleRoute(centro) }}
                      className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-all duration-200 active:scale-90 ${
                        isAdded ? 'bg-green-500 text-white shadow-sm' : 'bg-primary text-white shadow-sm hover:bg-blue-700'
                      }`}
                    >
                      {isAdded
                        ? <Check size={13} strokeWidth={2.5} />
                        : <Plus size={13} strokeWidth={2.5} />
                      }
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="flex-1 relative">
        {selectedCentro && (
          <div className="absolute top-4 right-4 z-10 bg-white rounded-2xl shadow-xl border border-gray-100 p-5 w-72 animate-in fade-in slide-in-from-right-4 duration-200">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-bold text-sm text-gray-900 leading-tight">{selectedCentro.nombre}</h3>
                {selectedCentro.movil && (
                  <span className="inline-flex items-center gap-1 mt-1 text-xs font-semibold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">
                    📍 Móvil · {selectedCentro.dias_activo ?? 0} días activo
                  </span>
                )}
              </div>
              <button onClick={() => setSelectedCentro(null)} className="text-gray-400 hover:text-gray-600 transition-colors ml-2 mt-0.5 active:scale-90">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>
            <div className="space-y-2 text-xs text-gray-600">
              <InfoRow label="Materiales Aceptados" value={selectedCentro.materiales.join(', ')} />
              <InfoRow label="Horario"    value={selectedCentro.horario} />
              <InfoRow label="Dirección"  value={selectedCentro.direccion} />
              <InfoRow label="Tetrapak"   value={selectedCentro.tetrapak ? 'Sí' : 'No'} />
              <InfoRow label="Días"       value={selectedCentro.dias.join(', ')} />
            </div>
            <button
              onClick={() => toggleRoute(selectedCentro)}
              className={`mt-4 w-full py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 active:scale-95 shadow-sm ${
                addedRoutes.includes(selectedCentro.id)
                  ? 'bg-green-500 text-white'
                  : 'bg-primary text-white hover:bg-blue-700'
              }`}
            >
              {addedRoutes.includes(selectedCentro.id) ? '✓ Añadido a la ruta' : '+ Añadir a la ruta'}
            </button>
          </div>
        )}
        <MockMap
          centros={filteredCentros}
          onMarkerClick={setSelectedCentro}
          showGeofencing={true}
          selectedCentro={selectedCentro}
          height="100%"
        />
      </div>
    </div>
  )
}

function InfoRow({ label, value }) {
  return (
    <div className="flex gap-1.5">
      <span className="font-semibold text-gray-700 shrink-0">{label}:</span>
      <span className="text-gray-500">{value}</span>
    </div>
  )
}
