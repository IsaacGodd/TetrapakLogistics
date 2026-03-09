import { haversineDistance } from './geo'

/**
 * Fetch real road geometry from OSRM public API (free, no API key).
 * Falls back to straight-line polyline if OSRM is unavailable.
 *
 * @param {Array<{lat: number, lng: number}>} waypoints — ordered stops
 * @returns {Promise<{
 *   coordinates: [number, number][],  // [lat, lng] pairs for Leaflet
 *   distanceKm: number,
 *   durationSec: number,
 *   source: 'osrm' | 'fallback'
 * }>}
 */
export async function fetchOsrmRoute(waypoints) {
  if (!waypoints || waypoints.length < 2) {
    return { coordinates: [], distanceKm: 0, durationSec: 0, source: 'fallback' }
  }

  // OSRM expects lng,lat (GeoJSON order)
  const coords = waypoints.map(w => `${w.lng},${w.lat}`).join(';')
  const url = `https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson`

  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(5000) })
    if (!res.ok) throw new Error(`OSRM HTTP ${res.status}`)
    const data = await res.json()
    if (data.code !== 'Ok' || !data.routes?.[0]) throw new Error('OSRM: no route found')

    const route = data.routes[0]
    // GeoJSON coords are [lng, lat] — flip to [lat, lng] for Leaflet
    const coordinates = route.geometry.coordinates.map(([lng, lat]) => [lat, lng])

    return {
      coordinates,
      distanceKm: route.distance / 1000,
      durationSec: route.duration,
      source: 'osrm',
    }
  } catch (err) {
    console.warn('[OSRM] Fallback to straight lines:', err.message)
    return fallbackRoute(waypoints)
  }
}

function fallbackRoute(waypoints) {
  const coordinates = waypoints.map(w => [w.lat, w.lng])
  let distanceKm = 0
  for (let i = 0; i < waypoints.length - 1; i++) {
    distanceKm += haversineDistance(
      waypoints[i].lat, waypoints[i].lng,
      waypoints[i + 1].lat, waypoints[i + 1].lng
    )
  }
  return {
    coordinates,
    distanceKm,
    durationSec: (distanceKm / 40) * 3600,
    source: 'fallback',
  }
}

/**
 * Format distance + speed into a human-readable ETA string.
 * @param {number} distanceKm
 * @param {number} speedKmh — default 40
 * @returns {string} e.g. "1h 23min" or "45 min"
 */
export function formatEta(distanceKm, speedKmh = 40) {
  if (!distanceKm || distanceKm <= 0) return '—'
  const hours = distanceKm / speedKmh
  const h = Math.floor(hours)
  const m = Math.round((hours - h) * 60)
  if (h === 0) return `${m} min`
  if (m === 0) return `${h}h`
  return `${h}h ${m}min`
}
