import { useState, useMemo, useCallback, useEffect } from 'react'
import {
  Truck, Calendar, ChevronDown, Plus, Check, Download,
  Map, Route, Clock, AlertCircle, Navigation, X, Menu,
} from 'lucide-react'
import MockMap from '../components/MockMap'
import { diasSemana, materialesLista, transportistas as mockTransportistas } from '../data/mockData'
import { useData } from '../context/DataContext'
import { useTransportistasGPS } from '../hooks/useTransportistasGPS'
import { useGeofencing } from '../hooks/useGeofencing'
import { findOptimalRoute, calculateTotalDistance } from '../utils/dijkstra'
import { fetchOsrmRoute, formatEta } from '../utils/routing'

const ESTADO_LABEL = {
  en_ruta: 'En Ruta',
  en_centro: 'En Centro',
  descansando: 'Descansando',
  sin_asignar: 'Sin Asignar',
}

const ESTADO_STYLE = {
  en_ruta:     'bg-blue-50 text-blue-700 border border-blue-200',
  en_centro:   'bg-green-50 text-green-700 border border-green-200',
  descansando: 'bg-amber-50 text-amber-700 border border-amber-200',
  sin_asignar: 'bg-gray-100 text-gray-500 border border-gray-200',
}

function EstadoBadge({ estado }) {
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${ESTADO_STYLE[estado] ?? ESTADO_STYLE.sin_asignar}`}>
      {ESTADO_LABEL[estado] ?? estado}
    </span>
  )
}

export default function MapaTransportistas() {
  const { centros } = useData()

  // --- Existing state ---
  const [selectedDia, setSelectedDia] = useState('Lun')
  const [materialFiltro, setMaterialFiltro] = useState('Todos los materiales')
  const [tetrapakFiltro, setTetrapakFiltro] = useState('todos')
  const [selectedCentro, setSelectedCentro] = useState(null)
  const [addedRoutes, setAddedRoutes] = useState([])

  // --- New state ---
  const [activeTab, setActiveTab] = useState('centros') // 'centros' | 'transportistas'
  const [selectedTransportista, setSelectedTransportista] = useState(null)
  const [routePolyline, setRoutePolyline] = useState([])
  const [routeEta, setRouteEta] = useState(null)
  const [routeDistKm, setRouteDistKm] = useState(null)
  const [geofenceLog, setGeofenceLog] = useState([])
  const [notifications, setNotifications] = useState([])
  const [isCalculatingRoute, setIsCalculatingRoute] = useState(false)
  const [showAllRoutes, setShowAllRoutes] = useState(false)
  const [isLoadingAllRoutes, setIsLoadingAllRoutes] = useState(false)

  // --- GPS simulation ---
  const { transportistas: liveTransportistas, assignRoute } =
    useTransportistasGPS(mockTransportistas, centros)

  // --- Geofencing callbacks (stable refs to avoid infinite loops) ---
  const handleArrival = useCallback((tId, cId, ts) => {
    const t = liveTransportistas.find(x => x.id === tId)
    const c = centros.find(x => x.id === cId)
    if (!t || !c) return
    const msg = `${t.nombre} llegó a ${c.nombre}`
    const entry = { id: `${tId}-arrive-${ts}`, type: 'llegada', msg, ts, tId }
    setGeofenceLog(prev => [entry, ...prev].slice(0, 50))
    setNotifications(prev => [entry, ...prev].slice(0, 4))
  }, [liveTransportistas, centros])

  const handleDeparture = useCallback((tId, cId, ts) => {
    const t = liveTransportistas.find(x => x.id === tId)
    const c = centros.find(x => x.id === cId)
    if (!t || !c) return
    const msg = `${t.nombre} salió de ${c.nombre}`
    const entry = { id: `${tId}-depart-${ts}`, type: 'salida', msg, ts, tId }
    setGeofenceLog(prev => [entry, ...prev].slice(0, 50))
    setNotifications(prev => [entry, ...prev].slice(0, 4))
  }, [liveTransportistas, centros])

  useGeofencing(liveTransportistas, centros, 500, handleArrival, handleDeparture)

  // Auto-dismiss notifications after 5 seconds
  useEffect(() => {
    if (notifications.length === 0) return
    const id = setTimeout(() => {
      setNotifications(prev => prev.slice(0, -1))
    }, 5000)
    return () => clearTimeout(id)
  }, [notifications])

  // --- Filtered centros ---
  const filteredCentros = useMemo(() => {
    return centros.filter(c => {
      const diasOk = c.dias.includes(selectedDia)
      const materialOk = materialFiltro === 'Todos los materiales' ? true : c.materiales.includes(materialFiltro)
      const tetrapakOk = tetrapakFiltro === 'todos' ? true : tetrapakFiltro === 'si' ? c.tetrapak : !c.tetrapak
      return diasOk && materialOk && tetrapakOk
    })
  }, [centros, selectedDia, materialFiltro, tetrapakFiltro])

  const movilesDia = filteredCentros.filter(c => c.tetrapak).length
  const diasRows = [diasSemana.slice(0, 4), diasSemana.slice(4)]

  const toggleRoute = (centro) => {
    setAddedRoutes(prev =>
      prev.includes(centro.id) ? prev.filter(id => id !== centro.id) : [...prev, centro.id]
    )
  }

  // --- Route optimization ---
  const handleCalculateRoute = async () => {
    if (addedRoutes.length < 2) return
    const selectedCentros = centros.filter(c => addedRoutes.includes(c.id))
    const startLat = selectedTransportista?.lat ?? 25.6866
    const startLng = selectedTransportista?.lng ?? -100.3161

    const orderedIds = findOptimalRoute(startLat, startLng, selectedCentros)
    const orderedCentros = orderedIds.map(id => centros.find(c => c.id === id)).filter(Boolean)

    if (selectedTransportista) {
      assignRoute(selectedTransportista.id, orderedIds)
    }

    setIsCalculatingRoute(true)
    try {
      const waypoints = [
        { lat: startLat, lng: startLng },
        ...orderedCentros.map(c => ({ lat: c.lat, lng: c.lng })),
      ]
      const result = await fetchOsrmRoute(waypoints)
      const totalKm = calculateTotalDistance(startLat, startLng, orderedCentros)
      const speed = selectedTransportista?.velocidad ?? 40

      setRoutePolyline([{
        coordinates: result.coordinates,
        color: selectedTransportista?.color ?? '#1D6ADE',
        weight: 5,
        opacity: 0.85,
      }])
      setRouteEta(formatEta(totalKm, speed))
      setRouteDistKm(totalKm.toFixed(1))
    } finally {
      setIsCalculatingRoute(false)
    }
  }

  const clearRoute = () => {
    setRoutePolyline([])
    setRouteEta(null)
    setRouteDistKm(null)
    setAddedRoutes([])
    setShowAllRoutes(false)
  }

  // Select a transportista (from panel or map click) and auto-show their current route
  const selectTransportista = useCallback(async (t) => {
    // Deselect if clicking the same one
    if (selectedTransportista?.id === t?.id) {
      setSelectedTransportista(null)
      setRoutePolyline([])
      setRouteEta(null)
      setRouteDistKm(null)
      setShowAllRoutes(false)
      return
    }

    setSelectedTransportista(t)
    setShowAllRoutes(false)
    setActiveTab('transportistas') // always jump to transportistas tab on click

    if (!t?.rutaAsignada?.length) {
      setRoutePolyline([])
      setRouteEta(null)
      setRouteDistKm(null)
      return
    }

    // Show remaining route from current position
    const remaining = t.rutaAsignada.slice(t._stepIndex ?? 0)
    const stops = remaining.map(id => centros.find(c => c.id === id)).filter(Boolean)
    if (stops.length === 0) return

    const waypoints = [
      { lat: t.lat, lng: t.lng },
      ...stops.map(c => ({ lat: c.lat, lng: c.lng })),
    ]
    const result = await fetchOsrmRoute(waypoints)
    const dist = calculateTotalDistance(t.lat, t.lng, stops)
    setRoutePolyline([{ coordinates: result.coordinates, color: t.color, weight: 5, opacity: 0.85 }])
    setRouteEta(formatEta(dist, t.velocidad))
    setRouteDistKm(dist.toFixed(1))
  }, [selectedTransportista, centros])

  // Show all active routes at once
  const handleShowAllRoutes = useCallback(async () => {
    if (showAllRoutes) {
      setShowAllRoutes(false)
      setRoutePolyline([])
      return
    }

    const active = liveTransportistas.filter(t => t.rutaAsignada?.length > 0)
    if (active.length === 0) return

    setIsLoadingAllRoutes(true)
    setSelectedTransportista(null)
    setShowAllRoutes(true)

    try {
      const allPolylines = []
      for (const t of active) {
        const remaining = t.rutaAsignada.slice(t._stepIndex ?? 0)
        const stops = remaining.map(id => centros.find(c => c.id === id)).filter(Boolean)
        if (stops.length === 0) continue
        const waypoints = [{ lat: t.lat, lng: t.lng }, ...stops.map(c => ({ lat: c.lat, lng: c.lng }))]
        const result = await fetchOsrmRoute(waypoints)
        allPolylines.push({ coordinates: result.coordinates, color: t.color, weight: 4, opacity: 0.75 })
      }
      setRoutePolyline(allPolylines)
      setRouteEta(null)
      setRouteDistKm(null)
    } finally {
      setIsLoadingAllRoutes(false)
    }
  }, [showAllRoutes, liveTransportistas, centros])

  const [panelOpen, setPanelOpen] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden relative">
      {/* Mobile backdrop */}
      {panelOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/40 z-10" onClick={() => setPanelOpen(false)} />
      )}

      {/* ── Left Panel ── */}
      <div className={`absolute lg:relative inset-y-0 left-0 z-20 w-72 shrink-0 bg-white border-r border-gray-100 flex flex-col overflow-hidden shadow-xl lg:shadow-sm transition-transform duration-300 ${panelOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>

        {/* Header */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center shrink-0">
              <Truck size={14} strokeWidth={2} className="text-white" />
            </div>
            <h2 className="font-semibold text-sm text-gray-800">Ruta de Transporte</h2>
          </div>

          {/* Tab bar */}
          <div className="flex rounded-xl overflow-hidden border border-gray-200 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('centros')}
              className={`flex-1 py-2 flex items-center justify-center gap-1.5 transition-all duration-200 ${
                activeTab === 'centros'
                  ? 'bg-primary text-white'
                  : 'bg-white text-gray-500 hover:bg-gray-50'
              }`}
            >
              <Map size={12} strokeWidth={2} />
              Centros
            </button>
            <button
              onClick={() => setActiveTab('transportistas')}
              className={`flex-1 py-2 flex items-center justify-center gap-1.5 transition-all duration-200 ${
                activeTab === 'transportistas'
                  ? 'bg-primary text-white'
                  : 'bg-white text-gray-500 hover:bg-gray-50'
              }`}
            >
              <Truck size={12} strokeWidth={2} />
              Vehículos
              {liveTransportistas.filter(t => t.estado === 'en_ruta' || t.estado === 'en_centro').length > 0 && (
                <span className={`w-2 h-2 rounded-full ${activeTab === 'transportistas' ? 'bg-white' : 'bg-green-500'}`} />
              )}
            </button>
          </div>
        </div>

        {/* ── Tab: Centros ── */}
        {activeTab === 'centros' && (
          <>
            {/* Day + filters */}
            <div className="px-4 pt-3 pb-0 border-b border-gray-100 space-y-3">
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

              <div className="flex items-center justify-between pb-3">
                <button className="flex items-center gap-1.5 text-xs text-primary hover:underline transition-colors">
                  <Truck size={12} strokeWidth={2} />
                  {movilesDia} con Tetrapak este día
                </button>
                <button className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-primary transition-colors">
                  <Download size={12} strokeWidth={2} />
                  Exportar
                </button>
              </div>
            </div>

            {/* Calcular ruta button — visible when 2+ centros added */}
            {addedRoutes.length >= 2 && (
              <div className="px-3 py-2 border-b border-gray-100 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-gray-600">
                    {addedRoutes.length} centros seleccionados
                  </span>
                  <button onClick={clearRoute} className="text-gray-400 hover:text-gray-600 ml-auto">
                    <X size={13} />
                  </button>
                </div>
                {selectedTransportista ? (
                  <div className="flex items-center gap-2 text-xs">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ background: selectedTransportista.color }}
                    />
                    <span className="text-gray-600 truncate">{selectedTransportista.nombre}</span>
                  </div>
                ) : (
                  <p className="text-xs text-amber-600 flex items-center gap-1">
                    <AlertCircle size={11} />
                    Selecciona un vehículo primero
                  </p>
                )}
                <button
                  onClick={handleCalculateRoute}
                  disabled={isCalculatingRoute || !selectedTransportista}
                  className="w-full py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 active:scale-95 flex items-center justify-center gap-1.5 bg-primary text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                >
                  <Route size={13} strokeWidth={2} />
                  {isCalculatingRoute ? 'Calculando...' : 'Calcular Ruta Óptima'}
                </button>
              </div>
            )}

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
          </>
        )}

        {/* ── Tab: Transportistas ── */}
        {activeTab === 'transportistas' && (
          <div className="flex-1 overflow-y-auto p-3 space-y-2">

            {/* Ver todas las rutas button */}
            <button
              onClick={handleShowAllRoutes}
              disabled={isLoadingAllRoutes || liveTransportistas.filter(t => t.rutaAsignada?.length > 0).length === 0}
              className={`w-full py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all duration-200 active:scale-95 border ${
                showAllRoutes
                  ? 'bg-primary text-white border-primary'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-primary hover:text-primary'
              } disabled:opacity-40 disabled:cursor-not-allowed`}
            >
              <Route size={12} strokeWidth={2} />
              {isLoadingAllRoutes ? 'Cargando...' : showAllRoutes ? 'Ocultar todas las rutas' : 'Ver todas las rutas'}
            </button>

            <p className="text-xs font-semibold text-gray-500 px-1">
              Vehículos ({liveTransportistas.length})
            </p>

            {liveTransportistas.map(t => {
              const isSelected = selectedTransportista?.id === t.id
              const routeProgress = t.rutaAsignada?.length > 0
                ? Math.min(t._stepIndex ?? 0, t.rutaAsignada.length)
                : 0
              const routeTotal = t.rutaAsignada?.length ?? 0

              return (
                <div
                  key={t.id}
                  onClick={() => selectTransportista(t)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all duration-200 ${
                    isSelected
                      ? 'border-primary/40 bg-blue-50 shadow-sm'
                      : 'border-gray-100 hover:border-gray-200 bg-white hover:shadow-sm'
                  }`}
                >
                  {/* Name + color dot */}
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className="w-3 h-3 rounded-full shrink-0 shadow-sm"
                      style={{ background: t.color }}
                    />
                    <span className="text-xs font-semibold text-gray-800">{t.nombre}</span>
                    {isSelected && (
                      <span className="ml-auto text-xs text-primary font-semibold flex items-center gap-0.5">
                        <Route size={10} /> Ruta visible
                      </span>
                    )}
                  </div>

                  {/* Vehicle + plate */}
                  <p className="text-xs text-gray-400 ml-5">{t.vehiculo} · {t.placa}</p>

                  {/* Estado badge */}
                  <div className="mt-1.5 ml-5">
                    <EstadoBadge estado={t.estado} />
                  </div>

                  {/* Route progress bar */}
                  {routeTotal > 0 && (
                    <div className="mt-2 ml-5">
                      <div className="flex justify-between text-xs text-gray-400 mb-1">
                        <span>Ruta</span>
                        <span>{routeProgress}/{routeTotal} paradas</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-1.5">
                        <div
                          className="h-1.5 rounded-full transition-all duration-700"
                          style={{
                            width: `${routeTotal > 0 ? (routeProgress / routeTotal) * 100 : 0}%`,
                            background: t.color,
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Go to calculate route button */}
                  {isSelected && addedRoutes.length >= 2 && (
                    <button
                      onClick={e => { e.stopPropagation(); setActiveTab('centros') }}
                      className="mt-2 w-full py-1.5 rounded-lg text-xs font-semibold bg-primary/10 text-primary hover:bg-primary/20 transition-all duration-200"
                    >
                      Ir a calcular ruta →
                    </button>
                  )}
                </div>
              )
            })}

            {/* Event log — filtered by selected transportista */}
            {(() => {
              const filteredLog = selectedTransportista
                ? geofenceLog.filter(e => e.tId === selectedTransportista.id)
                : geofenceLog
              if (filteredLog.length === 0) return null
              return (
                <div className="mt-1">
                  <p className="text-xs font-semibold text-gray-500 px-1 mb-1.5">
                    {selectedTransportista
                      ? `Eventos de ${selectedTransportista.nombre}`
                      : 'Registro de eventos'}
                  </p>
                  <div className="space-y-1.5">
                    {filteredLog.slice(0, 10).map(entry => (
                      <div
                        key={entry.id}
                        className={`p-2 rounded-lg text-xs flex items-start gap-1.5 ${
                          entry.type === 'llegada'
                            ? 'bg-green-50 text-green-700'
                            : 'bg-blue-50 text-blue-700'
                        }`}
                      >
                        <Navigation size={10} className="mt-0.5 shrink-0" />
                        <div>
                          <p className="font-medium leading-tight">{entry.msg}</p>
                          <p className="opacity-60 mt-0.5">
                            {new Date(entry.ts).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })()}
          </div>
        )}
      </div>

      {/* ── Map Area ── */}
      <div className="flex-1 relative min-w-0">

        {/* Mobile panel toggle */}
        <button
          onClick={() => setPanelOpen(p => !p)}
          className="lg:hidden absolute bottom-6 left-4 z-20 bg-white rounded-xl px-3 py-2 shadow-md border border-gray-100 active:scale-95 transition-all flex items-center gap-1.5 text-xs font-semibold text-gray-700"
        >
          {panelOpen ? <X size={14} /> : <Menu size={14} />}
          {panelOpen ? 'Cerrar' : 'Panel'}
        </button>

        {/* Geofence notifications (top-left stack) */}
        <div className="absolute top-4 left-4 z-20 space-y-2 pointer-events-none">
          {notifications.map(n => (
            <div
              key={n.id}
              className={`px-3 py-2 rounded-xl shadow-lg text-xs font-semibold flex items-center gap-2 animate-in slide-in-from-left-4 duration-300 ${
                n.type === 'llegada'
                  ? 'bg-green-500 text-white'
                  : 'bg-blue-500 text-white'
              }`}
            >
              <Navigation size={12} />
              {n.msg}
            </div>
          ))}
        </div>

        {/* Centro detail card (top-right) */}
        {selectedCentro && (
          <div className="absolute top-4 right-4 z-10 bg-white rounded-2xl shadow-xl border border-gray-100 p-5 w-72 animate-in fade-in slide-in-from-right-4 duration-200">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-bold text-sm text-gray-900 leading-tight">{selectedCentro.nombre}</h3>
                {selectedCentro.movil && (
                  <span className="inline-flex items-center gap-1 mt-1 text-xs font-semibold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">
                    📍 Móvil
                  </span>
                )}
              </div>
              <button onClick={() => setSelectedCentro(null)} className="text-gray-400 hover:text-gray-600 transition-colors ml-2 mt-0.5 active:scale-90">
                <X size={16} />
              </button>
            </div>
            <div className="space-y-2 text-xs text-gray-600">
              <InfoRow label="Materiales" value={selectedCentro.materiales.join(', ')} />
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

        {/* Route ETA card (bottom-right) */}
        {routeEta && (
          <div className="absolute bottom-6 right-4 z-10 bg-white rounded-2xl shadow-xl border border-gray-100 p-4 w-64 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-primary rounded-lg flex items-center justify-center">
                  <Route size={12} strokeWidth={2} className="text-white" />
                </div>
                <span className="text-xs font-bold text-gray-800">Ruta Óptima</span>
              </div>
              <button onClick={clearRoute} className="text-gray-400 hover:text-gray-600">
                <X size={14} />
              </button>
            </div>
            <div className="flex items-center gap-4 mt-1">
              <div className="text-center">
                <div className="flex items-center gap-1 text-primary">
                  <Clock size={13} strokeWidth={2} />
                  <span className="text-lg font-bold">{routeEta}</span>
                </div>
                <p className="text-xs text-gray-400">Tiempo estimado</p>
              </div>
              <div className="text-center border-l border-gray-100 pl-4">
                <span className="text-lg font-bold text-gray-800">{routeDistKm} km</span>
                <p className="text-xs text-gray-400">Distancia total</p>
              </div>
            </div>
            {selectedTransportista && (
              <div className="mt-2 pt-2 border-t border-gray-100 flex items-center gap-1.5 text-xs text-gray-500">
                <span className="w-2 h-2 rounded-full" style={{ background: selectedTransportista.color }} />
                {selectedTransportista.nombre} · {addedRoutes.length} paradas
              </div>
            )}
          </div>
        )}

        <MockMap
          centros={filteredCentros}
          onMarkerClick={setSelectedCentro}
          showGeofencing={true}
          selectedCentro={selectedCentro}
          height="100%"
          transportistas={liveTransportistas}
          routePolylines={routePolyline}
          showRouteLine={routePolyline.length > 0}
          onTransportistaClick={selectTransportista}
          selectedTransportistaId={selectedTransportista?.id ?? null}
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
