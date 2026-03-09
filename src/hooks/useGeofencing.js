import { useEffect, useRef } from 'react'
import { isWithinRadius } from '../utils/geo'

/**
 * Detects when transportistas enter or exit geofences around centros.
 * Fires onArrival / onDeparture callbacks only at the moment of state change.
 *
 * @param {Array} transportistas — live positions from useTransportistasGPS
 * @param {Array} centros        — from DataContext (must have lat/lng and id)
 * @param {number} radiusMeters  — geofence radius (default 500m)
 * @param {Function} onArrival   — (transportistaId, centroId, isoTimestamp) => void
 * @param {Function} onDeparture — (transportistaId, centroId, isoTimestamp) => void
 */
export function useGeofencing(
  transportistas,
  centros,
  radiusMeters = 500,
  onArrival,
  onDeparture
) {
  // Map<transportistaId, Set<centroId>> — tracks who is currently inside which geofence
  const insideRef = useRef(new Map())

  useEffect(() => {
    if (!transportistas?.length || !centros?.length) return

    transportistas.forEach(t => {
      if (!insideRef.current.has(t.id)) {
        insideRef.current.set(t.id, new Set())
      }
      const prevInside = insideRef.current.get(t.id)

      centros.forEach(c => {
        const nowInside = isWithinRadius(t.lat, t.lng, c.lat, c.lng, radiusMeters)
        const wasInside = prevInside.has(c.id)

        if (nowInside && !wasInside) {
          prevInside.add(c.id)
          onArrival?.(t.id, c.id, new Date().toISOString())
        } else if (!nowInside && wasInside) {
          prevInside.delete(c.id)
          onDeparture?.(t.id, c.id, new Date().toISOString())
        }
      })
    })
  }, [transportistas]) // runs every GPS tick

  return {
    /** Returns array of centro IDs that a transportista is currently inside */
    getCurrentlyInside: (transportistaId) =>
      [...(insideRef.current.get(transportistaId) ?? [])],
  }
}
