import { haversineDistance } from './geo'

/**
 * Nearest-Neighbor TSP heuristic (greedy shortest path visiting all centros).
 * Starts from a given position and always visits the closest unvisited centro next.
 *
 * @param {number} startLat
 * @param {number} startLng
 * @param {Array<{id: string, lat: number, lng: number}>} centros — subset to visit
 * @returns {string[]} ordered array of centro IDs (optimal visit order)
 */
export function findOptimalRoute(startLat, startLng, centros) {
  if (!centros || centros.length === 0) return []
  if (centros.length === 1) return [centros[0].id]

  const unvisited = [...centros]
  const route = []
  let currentLat = startLat
  let currentLng = startLng

  while (unvisited.length > 0) {
    let minDist = Infinity
    let nearestIdx = -1

    unvisited.forEach((c, i) => {
      const d = haversineDistance(currentLat, currentLng, c.lat, c.lng)
      if (d < minDist) {
        minDist = d
        nearestIdx = i
      }
    })

    const nearest = unvisited[nearestIdx]
    route.push(nearest.id)
    currentLat = nearest.lat
    currentLng = nearest.lng
    unvisited.splice(nearestIdx, 1)
  }

  return route
}

/**
 * Sum of Haversine distances along an ordered route.
 *
 * @param {number} startLat
 * @param {number} startLng
 * @param {Array<{lat: number, lng: number}>} orderedCentros
 * @returns {number} total km
 */
export function calculateTotalDistance(startLat, startLng, orderedCentros) {
  if (!orderedCentros || orderedCentros.length === 0) return 0
  let total = haversineDistance(startLat, startLng, orderedCentros[0].lat, orderedCentros[0].lng)
  for (let i = 0; i < orderedCentros.length - 1; i++) {
    total += haversineDistance(
      orderedCentros[i].lat, orderedCentros[i].lng,
      orderedCentros[i + 1].lat, orderedCentros[i + 1].lng
    )
  }
  return total
}
