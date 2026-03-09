/**
 * Haversine distance between two lat/lng points.
 * @returns {number} distance in kilometers
 */
export function haversineDistance(lat1, lng1, lat2, lng2) {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

/**
 * Check if a point is within a radius of a center.
 * @returns {boolean}
 */
export function isWithinRadius(pointLat, pointLng, centerLat, centerLng, radiusMeters) {
  return haversineDistance(pointLat, pointLng, centerLat, centerLng) * 1000 <= radiusMeters
}
