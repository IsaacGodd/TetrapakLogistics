import { useEffect, useRef, useState, useCallback } from 'react'
import { haversineDistance } from '../utils/geo'

const TICK_MS = 3000 // update every 3 seconds

/**
 * Simulates real-time GPS movement for transportistas.
 * Each transportista moves step-by-step toward the next centro in their route.
 *
 * @param {Array} initialTransportistas — from mockData.transportistas
 * @param {Array} centros               — from DataContext (must have lat/lng)
 * @param {boolean} running             — pause/resume simulation
 * @returns {{ transportistas: Array, assignRoute: Function }}
 */
export function useTransportistasGPS(initialTransportistas, centros, running = true) {
  // Internal mutable state (avoids stale closures inside setInterval)
  const stateRef = useRef(
    initialTransportistas.map(t => ({
      ...t,
      _stepIndex: 0,
      _progress: 0,
      _prevLat: t.lat,
      _prevLng: t.lng,
      _nextLat: t.lat,
      _nextLng: t.lng,
    }))
  )

  const [liveList, setLiveList] = useState(stateRef.current)

  const tick = useCallback(() => {
    let changed = false

    stateRef.current = stateRef.current.map(t => {
      if (t.estado === 'sin_asignar' || t.estado === 'descansando') return t
      if (!t.rutaAsignada || t.rutaAsignada.length === 0) return t

      const target = centros.find(c => c.id === t.rutaAsignada[t._stepIndex])
      if (!target) {
        // Route exhausted or centro not found
        if (t.estado !== 'descansando') {
          changed = true
          return { ...t, estado: 'descansando' }
        }
        return t
      }

      // Distance per tick: speed(km/h) × (TICK_MS/1000 / 3600) km
      const legDistKm = haversineDistance(t._prevLat, t._prevLng, target.lat, target.lng)
      const stepKm = t.velocidad * (TICK_MS / 1000 / 3600)
      const stepProgress = legDistKm > 0 ? stepKm / legDistKm : 1

      const newProgress = t._progress + stepProgress
      changed = true

      if (newProgress >= 1) {
        // Arrived at this centro
        const nextStepIndex = t._stepIndex + 1
        const nextCentro = centros.find(c => c.id === t.rutaAsignada[nextStepIndex])

        if (!nextCentro) {
          // Completed all stops
          return {
            ...t,
            lat: target.lat,
            lng: target.lng,
            estado: 'descansando',
            _stepIndex: nextStepIndex,
            _progress: 0,
            _prevLat: target.lat,
            _prevLng: target.lng,
            _nextLat: target.lat,
            _nextLng: target.lng,
          }
        }

        // Move to next leg
        return {
          ...t,
          lat: target.lat,
          lng: target.lng,
          estado: 'en_ruta',
          _stepIndex: nextStepIndex,
          _progress: 0,
          _prevLat: target.lat,
          _prevLng: target.lng,
          _nextLat: nextCentro.lat,
          _nextLng: nextCentro.lng,
        }
      }

      // Interpolate position along current leg
      const lat = t._prevLat + (target.lat - t._prevLat) * newProgress
      const lng = t._prevLng + (target.lng - t._prevLng) * newProgress

      return { ...t, lat, lng, _progress: newProgress }
    })

    if (changed) setLiveList([...stateRef.current])
  }, [centros])

  useEffect(() => {
    if (!running) return
    const id = setInterval(tick, TICK_MS)
    return () => clearInterval(id)
  }, [running, tick])

  /**
   * Assign an ordered list of centro IDs to a transportista.
   * Transportista immediately starts moving toward the first centro.
   */
  const assignRoute = useCallback((transportistaId, centroIds) => {
    stateRef.current = stateRef.current.map(t => {
      if (t.id !== transportistaId) return t

      const firstCentro = centros.find(c => c.id === centroIds[0])
      return {
        ...t,
        rutaAsignada: centroIds,
        estado: centroIds.length > 0 ? 'en_ruta' : 'sin_asignar',
        _stepIndex: 0,
        _progress: 0,
        _prevLat: t.lat,
        _prevLng: t.lng,
        _nextLat: firstCentro?.lat ?? t.lat,
        _nextLng: firstCentro?.lng ?? t.lng,
      }
    })
    setLiveList([...stateRef.current])
  }, [centros])

  return { transportistas: liveList, assignRoute }
}
