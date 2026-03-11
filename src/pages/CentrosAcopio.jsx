import { useEffect, useMemo, useState, useRef } from 'react'
import { MapPin, Calendar, ChevronDown, Info, ExternalLink, Menu, X, Recycle, Check } from 'lucide-react'
import MockMap from '../components/MockMap'
import { diasSemana, materialesLista } from '../data/mockData'
import { useData } from '../context/DataContext'
import { useRecycling } from '../context/RecyclingContext'

const seedCentros = [
  {
    id: 9101,
    nombre: 'Centro Norte - San Nicolás',
    horario: '8:00 - 17:00',
    dias: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie'],
    materiales: ['Vidrio', 'Plástico', 'Tetrapak', 'Poliestireno'],
    tetrapak: true,
    movil: false,
    dias_activo: 0,
    lat: 25.7514,
    lng: -100.2773,
    direccion: 'Av. Universidad 1234, San Nicolás de los Garza',
    telefono: '81 9999 0001',
  },
  {
    id: 9102,
    nombre: 'Centro Sur - Cumbres',
    horario: '9:00 - 17:00',
    dias: ['Lun', 'Mié', 'Vie'],
    materiales: ['Plástico', 'Cartón', 'Tetrapak', 'PET'],
    tetrapak: true,
    movil: false,
    dias_activo: 0,
    lat: 25.7012,
    lng: -100.351,
    direccion: 'Blvd. Cumbres 567, Monterrey',
    telefono: '81 9999 0002',
  },
  {
    id: 9103,
    nombre: 'Punto Móvil Plaza',
    horario: '10:00 - 14:00',
    dias: ['Sáb', 'Dom'],
    materiales: ['Tetrapak', 'Plástico', 'PET'],
    tetrapak: true,
    movil: true,
    dias_activo: 7,
    lat: 25.68,
    lng: -100.31,
    direccion: 'Plaza Principal, Monterrey',
    telefono: '81 9999 0099',
  },
]

export default function CentrosAcopio() {
  const { centros } = useData()
  const [selectedDia, setSelectedDia] = useState('Lun')
  const [materialFiltro, setMaterialFiltro] = useState('Todos')
  const [tetrapakFiltro, setTetrapakFiltro] = useState('todos')
  const [selectedCentro, setSelectedCentro] = useState(null)

  const sourceCentros = centros.length ? centros : seedCentros

  const normalize = (value) => String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase()

  const diaMatches = (centro, dia) => {
    const dias = Array.isArray(centro?.dias)
      ? centro.dias
      : String(centro?.dias ?? '').split(',').map(d => d.trim()).filter(Boolean)
    const wanted = normalize(dia)
    return dias.some(d => normalize(d) === wanted)
  }

  const autoDia = useMemo(() => {
    if (sourceCentros.some(c => diaMatches(c, selectedDia))) return selectedDia
    const firstWithData = diasSemana.find(dia => sourceCentros.some(c => diaMatches(c, dia)))
    return firstWithData || selectedDia
  }, [sourceCentros, selectedDia])

  useEffect(() => {
    if (autoDia !== selectedDia) setSelectedDia(autoDia)
  }, [autoDia, selectedDia])

  const filteredCentros = useMemo(() => {
    return sourceCentros.filter(c => {
      const diasOk = diaMatches(c, autoDia)
      const materialOk = materialFiltro === 'Todos' || materialFiltro === 'Todos los materiales' ? true : c.materiales.includes(materialFiltro)
      const tetrapakOk = tetrapakFiltro === 'todos' ? true : tetrapakFiltro === 'si' ? c.tetrapak : !c.tetrapak
      return diasOk && materialOk && tetrapakOk
    })
  }, [sourceCentros, autoDia, materialFiltro, tetrapakFiltro])

  useEffect(() => {
    if (!selectedCentro) return
    if (!filteredCentros.some(c => c.id === selectedCentro.id)) setSelectedCentro(null)
  }, [filteredCentros, selectedCentro])

  const diasRows = [diasSemana.slice(0, 4), diasSemana.slice(4)]
  const [panelOpen, setPanelOpen] = useState(false)

  // ── Recycling modal ──
  const { registerRecycling } = useRecycling()
  const [recycleStep, setRecycleStep] = useState(null) // null | 'form' | 'impact'
  const [recycleName, setRecycleName] = useState('')
  const [recycleImpacto, setRecycleImpacto] = useState(null)
  const [recycleLoading, setRecycleLoading] = useState(false)
  const nameInputRef = useRef(null)

  function todayKey(centroNombre) {
    return `tl_recycled_today_${centroNombre}_${new Date().toISOString().slice(0, 10)}`
  }
  function alreadyRecycledToday(centroNombre) {
    return Boolean(localStorage.getItem(todayKey(centroNombre)))
  }

  function openRecycleModal() {
    setRecycleName('')
    setRecycleImpacto(null)
    setRecycleStep('form')
    setTimeout(() => nameInputRef.current?.focus(), 100)
  }

  async function handleConfirmRecycle() {
    if (!recycleName.trim() || !selectedCentro) return
    setRecycleLoading(true)
    try {
      const data = await registerRecycling(recycleName.trim(), selectedCentro.nombre)
      setRecycleImpacto(data.impacto)
      localStorage.setItem(todayKey(selectedCentro.nombre), '1')
      setRecycleStep('impact')
    } catch {
      // silently ignore — form stays open
    } finally {
      setRecycleLoading(false)
    }
  }

  return (
    <div className="flex h-screen overflow-hidden relative">
      {/* Mobile backdrop */}
      {panelOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/40 z-10" onClick={() => setPanelOpen(false)} />
      )}

      {/* Left Panel */}
      <div className={`absolute lg:relative inset-y-0 left-0 z-20 w-72 shrink-0 bg-white border-r border-gray-100 flex flex-col overflow-hidden shadow-xl lg:shadow-sm transition-transform duration-300 ${panelOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>

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
                      className={`py-1.5 text-xs rounded-lg font-medium transition-all duration-200 active:scale-95 ${selectedDia === dia
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
                { val: 'si', label: '✓ Sí' },
                { val: 'no', label: 'No' },
              ].map(({ val, label }) => (
                <button
                  key={val}
                  onClick={() => setTetrapakFiltro(val)}
                  className={`flex-1 py-2 transition-all duration-200 active:scale-95 ${tetrapakFiltro === val
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
                  className={`p-3 rounded-xl border cursor-pointer transition-all duration-200 hover:shadow-sm ${isSelected
                    ? 'border-primary/30 bg-blue-50 shadow-sm'
                    : 'border-gray-100 hover:border-gray-200 bg-white'
                    }`}
                >
                  <p className="text-xs font-semibold text-gray-800 leading-tight">{centro.nombre}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{centro.horario}</p>
                  {centro.tetrapak
                    ? <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-600 mt-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeWidth="3" d="M5 13l4 4L19 7" />
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
      <div className="flex-1 relative min-w-0">
        {/* Mobile panel toggle */}
        <button
          onClick={() => setPanelOpen(p => !p)}
          className="lg:hidden absolute bottom-28 left-4 z-20 bg-white rounded-xl px-3 py-2 shadow-md border border-gray-100 active:scale-95 transition-all flex items-center gap-1.5 text-xs font-semibold text-gray-700"
        >
          {panelOpen ? <X size={14} /> : <Menu size={14} />}
          {panelOpen ? 'Cerrar' : 'Filtros'}
        </button>

        {selectedCentro && (
          <div className="absolute top-4 right-4 z-10 bg-white rounded-2xl shadow-xl border border-gray-100 p-5 w-72">
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
                  <path strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
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

            {alreadyRecycledToday(selectedCentro.nombre) ? (
              <div className="mt-2 flex items-center justify-center gap-1.5 w-full py-2 text-xs font-semibold text-green-700 bg-green-50 rounded-xl border border-green-200">
                <Check size={13} strokeWidth={2.5} /> Ya reciclaste aquí hoy
              </div>
            ) : (
              <button
                onClick={openRecycleModal}
                className="mt-2 flex items-center justify-center gap-1.5 w-full py-2.5 bg-green-600 hover:bg-green-700 text-white text-xs rounded-xl font-semibold transition-all active:scale-95 shadow-sm"
              >
                <Recycle size={13} strokeWidth={2} /> Registré mi reciclaje aquí
              </button>
            )}
            <button onClick={() => setSelectedCentro(null)} className="mt-2 w-full py-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors">Cerrar</button>
          </div>
        )}
        {/* ── Recycling Modal ── */}
        {recycleStep && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-in fade-in zoom-in-95 duration-200">

              {recycleStep === 'form' && (
                <>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-9 h-9 bg-green-100 rounded-xl flex items-center justify-center shrink-0">
                      <Recycle size={18} className="text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-gray-900">¡Registra tu reciclaje!</h3>
                      <p className="text-xs text-gray-500 leading-tight">{selectedCentro?.nombre}</p>
                    </div>
                  </div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1.5">¿Cómo te llamas?</label>
                  <input
                    ref={nameInputRef}
                    type="text"
                    value={recycleName}
                    onChange={e => setRecycleName(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleConfirmRecycle()}
                    placeholder="Ej. Ana García"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-200 transition-all"
                  />
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => setRecycleStep(null)}
                      className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-all active:scale-95"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleConfirmRecycle}
                      disabled={!recycleName.trim() || recycleLoading}
                      className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 shadow-sm"
                    >
                      {recycleLoading ? 'Registrando...' : 'Confirmar'}
                    </button>
                  </div>
                </>
              )}

              {recycleStep === 'impact' && recycleImpacto && (
                <>
                  <div className="text-center mb-4">
                    <div className="text-4xl mb-2">🌱</div>
                    <h3 className="text-lg font-black text-gray-900">¡Solicitud enviada!</h3>
                    <p className="text-xs text-gray-500 mt-1">Tu registro en {selectedCentro?.nombre}</p>
                  </div>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-3 bg-green-50 rounded-xl px-4 py-3">
                      <span className="text-xl">♻️</span>
                      <div>
                        <p className="text-xs text-gray-500">Envases evitados</p>
                        <p className="text-base font-black text-green-700">{recycleImpacto.envases} envases</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 bg-blue-50 rounded-xl px-4 py-3">
                      <span className="text-xl">💧</span>
                      <div>
                        <p className="text-xs text-gray-500">Agua ahorrada</p>
                        <p className="text-base font-black text-blue-700">{recycleImpacto.agua} litros</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3">
                      <span className="text-xl">🌍</span>
                      <div>
                        <p className="text-xs text-gray-500">CO₂ evitado</p>
                        <p className="text-base font-black text-gray-700">{recycleImpacto.co2} kg</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5 mb-4">
                    <span className="text-base shrink-0">⏳</span>
                    <p className="text-xs text-amber-800 leading-relaxed">
                      Tu solicitud está <span className="font-semibold">pendiente de aprobación</span>. Un empleado la revisará pronto. Cuando sea aprobada, recibirás un código de confirmación y tu aporte contará en el ranking.
                    </p>
                  </div>
                  <button
                    onClick={() => setRecycleStep(null)}
                    className="w-full py-3 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 transition-all active:scale-95 shadow-sm"
                  >
                    ¡Entendido! 👍
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        <MockMap
          centros={filteredCentros}
          onMarkerClick={setSelectedCentro}
          showGeofencing={true}
          showTransportistas={false}
          selectedCentro={selectedCentro}
          height="100%"
        />
      </div>
    </div>
  )
}
