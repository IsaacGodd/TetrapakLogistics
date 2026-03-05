import { useState, useMemo } from 'react'
import { MapPin, Calendar, ChevronDown, Info, ExternalLink } from 'lucide-react'
import MockMap from '../components/MockMap'
import { centros, diasSemana, materialesLista } from '../data/mockData'

export default function CentrosAcopio() {
  const [selectedDia, setSelectedDia] = useState('Lun')
  const [materialFiltro, setMaterialFiltro] = useState('Todos')
  const [tetrapakFiltro, setTetrapakFiltro] = useState('todos')
  const [selectedCentro, setSelectedCentro] = useState(null)

  const filteredCentros = useMemo(() => {
    return centros.filter(c => {
      const diasOk = c.dias.includes(selectedDia)
      const materialOk = materialFiltro === 'Todos' || materialFiltro === 'Todos los materiales' ? true : c.materiales.includes(materialFiltro)
      const tetrapakOk = tetrapakFiltro === 'todos' ? true : tetrapakFiltro === 'si' ? c.tetrapak : !c.tetrapak
      return diasOk && materialOk && tetrapakOk
    })
  }, [selectedDia, materialFiltro, tetrapakFiltro])

  const diasRows = [diasSemana.slice(0, 4), diasSemana.slice(4)]

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Left Panel */}
      <div className="w-72 shrink-0 bg-white border-r border-gray-100 flex flex-col overflow-hidden shadow-sm">

        {/* Header */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center gap-2 mb-1">
            <MapPin size={16} strokeWidth={2} className="text-primary shrink-0" />
            <h2 className="font-bold text-sm text-gray-800">Centros de Acopio - Monterrey</h2>
          </div>
          <p className="text-xs text-gray-500 mt-1 leading-relaxed">
            Encuentra el centro de acopio más cercano para depositar tus materiales reciclables.
          </p>
        </div>

        {/* Filters */}
        <div className="px-4 py-3 border-b border-gray-100 space-y-3">
          {/* Day */}
          <div className="bg-gray-50 rounded-xl p-3">
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

          {/* Material */}
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Material</label>
            <div className="relative">
              <select
                value={materialFiltro}
                onChange={e => setMaterialFiltro(e.target.value)}
                className="w-full text-xs border border-gray-200 rounded-xl px-3 py-2.5 pr-8 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all appearance-none bg-white cursor-pointer"
              >
                <option>Todos</option>
                {materialesLista.slice(1).map(m => <option key={m}>{m}</option>)}
              </select>
              <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Tetrapak */}
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
                      ? val === 'todos' ? 'bg-green-600 text-white' : val === 'si' ? 'bg-primary text-white' : 'bg-gray-600 text-white'
                      : 'bg-white text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Info alert */}
          <div className="flex gap-2 bg-blue-50 border border-blue-100 rounded-xl px-3 py-2.5">
            <Info size={13} strokeWidth={2} className="text-blue-500 shrink-0 mt-0.5" />
            <p className="text-xs text-blue-700 leading-relaxed">
              Haz clic en un marcador y selecciona "Ir a este centro" para trazar tu ruta.
            </p>
          </div>
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
              return (
                <div
                  key={centro.id}
                  onClick={() => setSelectedCentro(centro)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all duration-200 hover:shadow-sm ${
                    isSelected
                      ? 'border-primary/30 bg-blue-50 shadow-sm'
                      : 'border-gray-100 hover:border-gray-200 bg-white'
                  }`}
                >
                  <p className="text-xs font-semibold text-gray-800 leading-tight">{centro.nombre}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{centro.horario}</p>
                  {centro.tetrapak
                    ? <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-600 mt-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeWidth="3" d="M5 13l4 4L19 7"/>
                        </svg>
                        Tetrapak
                      </span>
                    : <span className="text-xs text-gray-400 mt-1 block">Sin Tetrapak</span>
                  }
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="flex-1 relative">
        {selectedCentro && (
          <div className="absolute top-4 right-4 z-10 bg-white rounded-2xl shadow-xl border border-gray-100 p-5 w-72">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-bold text-sm text-gray-900 leading-tight">{selectedCentro.nombre}</h3>
                {selectedCentro.tetrapak && (
                  <span className="inline-flex items-center gap-1 mt-1 text-xs font-semibold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">Móvil</span>
                )}
              </div>
              <button onClick={() => setSelectedCentro(null)} className="text-gray-400 hover:text-gray-600 transition-colors ml-2 mt-0.5 active:scale-90">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>
            <div className="space-y-2 text-xs text-gray-600">
              <div><span className="font-semibold text-gray-700">Dirección:</span> {selectedCentro.direccion}</div>
              <div><span className="font-semibold text-gray-700">Horario:</span> {selectedCentro.horario}</div>
              <div><span className="font-semibold text-gray-700">Teléfono:</span> {selectedCentro.telefono}</div>
              <div><span className="font-semibold text-gray-700">Materiales:</span> {selectedCentro.materiales.join(', ')}</div>
              <div><span className="font-semibold text-gray-700">Días:</span> {selectedCentro.dias.join(', ')}</div>
            </div>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${selectedCentro.lat},${selectedCentro.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 flex items-center justify-center gap-2 w-full py-2.5 bg-primary text-white text-xs rounded-xl hover:bg-blue-700 transition-all duration-200 active:scale-95 font-semibold shadow-sm"
            >
              <ExternalLink size={13} strokeWidth={2} />
              Ir a este centro
            </a>
            <button onClick={() => setSelectedCentro(null)} className="mt-2 w-full py-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors">Cerrar</button>
          </div>
        )}
        <MockMap
          centros={filteredCentros}
          onMarkerClick={setSelectedCentro}
          showGeofencing={false}
          selectedCentro={selectedCentro}
          height="100%"
        />
      </div>
    </div>
  )
}
