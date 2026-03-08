import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Circle, GoogleMap, InfoWindow, Marker, useJsApiLoader } from '@react-google-maps/api'

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyDiAEkEJB5Er50Sqx6HUDTVJ95xPgxyrUs'
const MONTERREY_CENTER = { lat: 25.6866, lng: -100.3161 }
const DEFAULT_GEOFENCE_RADIUS = 180

function toNumber(value) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

function createTransportistas(baseCentros) {
  const candidates = baseCentros.filter(c => c.tetrapak || c.movil).slice(0, 6)
  return candidates.map((centro, index) => ({
    id: `tr-${centro.id}-${index}`,
    name: `Transportista ${index + 1}`,
    centroId: centro.id,
    center: { lat: centro.lat, lng: centro.lng },
    angle: Math.random() * Math.PI * 2,
    speed: 0.05 + Math.random() * 0.03,
    radiusKm: 0.3 + (index % 3) * 0.2,
  }))
}

function moveTransportista(item) {
  const nextAngle = item.angle + item.speed
  const latScale = item.radiusKm / 111
  const lngScale = item.radiusKm / (111 * Math.max(Math.cos((item.center.lat * Math.PI) / 180), 0.25))

  return {
    ...item,
    angle: nextAngle,
    position: {
      lat: item.center.lat + latScale * Math.cos(nextAngle),
      lng: item.center.lng + lngScale * Math.sin(nextAngle),
    },
  }
}

export default function MockMap({
  centros,
  onMarkerClick,
  showGeofencing = false,
  showTransportistas = false,
  selectedCentro = null,
  height = '100%',
}) {
  const mapRef = useRef(null)
  const [selectedTransportista, setSelectedTransportista] = useState(null)

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'tetrapak-google-maps',
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
  })

  const validCentros = useMemo(() => {
    return (centros || [])
      .map(c => ({ ...c, lat: toNumber(c.lat), lng: toNumber(c.lng) }))
      .filter(c => c.lat !== null && c.lng !== null)
  }, [centros])

  const [transportistas, setTransportistas] = useState([])

  useEffect(() => {
    if (!showTransportistas) {
      setTransportistas([])
      return
    }
    const seeded = createTransportistas(validCentros).map(moveTransportista)
    setTransportistas(seeded)
  }, [validCentros, showTransportistas])

  useEffect(() => {
    if (!transportistas.length) return undefined
    const timer = window.setInterval(() => {
      setTransportistas(prev => prev.map(moveTransportista))
    }, 2000)
    return () => window.clearInterval(timer)
  }, [transportistas.length])

  useEffect(() => {
    if (!isLoaded || !mapRef.current || validCentros.length === 0) return
    const map = mapRef.current

    if (validCentros.length === 1) {
      map.panTo({ lat: validCentros[0].lat, lng: validCentros[0].lng })
      map.setZoom(12)
      return
    }

    const bounds = new window.google.maps.LatLngBounds()
    validCentros.forEach(c => bounds.extend({ lat: c.lat, lng: c.lng }))
    map.fitBounds(bounds, 80)
    window.google.maps.event.addListenerOnce(map, 'idle', () => {
      if (map.getZoom() > 13) map.setZoom(13)
    })
  }, [isLoaded, validCentros])

  useEffect(() => {
    if (!isLoaded || !mapRef.current || !selectedCentro) return
    const lat = toNumber(selectedCentro.lat)
    const lng = toNumber(selectedCentro.lng)
    if (lat === null || lng === null) return
    mapRef.current.panTo({ lat, lng })
  }, [isLoaded, selectedCentro])

  const mapCenter = validCentros[0]
    ? { lat: validCentros[0].lat, lng: validCentros[0].lng }
    : MONTERREY_CENTER

  const onMapLoad = useCallback((map) => {
    mapRef.current = map
  }, [])

  if (loadError) {
    return (
      <div className="h-full min-h-[300px] grid place-items-center bg-red-50 text-red-700 text-sm">
        Error cargando Google Maps. Revisa la API Key o las restricciones del dominio.
      </div>
    )
  }

  if (!isLoaded) {
    return (
      <div className="h-full min-h-[300px] grid place-items-center bg-gray-50 text-gray-500 text-sm">
        Cargando mapa de Google...
      </div>
    )
  }

  return (
    <GoogleMap
      onLoad={onMapLoad}
      center={mapCenter}
      zoom={12}
      mapContainerStyle={{ width: '100%', height, minHeight: 300, zIndex: 0 }}
      options={{
        mapTypeControl: false,
        fullscreenControl: false,
        streetViewControl: false,
      }}
    >
      {validCentros.map(centro => {
        const isSelected = selectedCentro?.id === centro.id
        const markerColor = isSelected ? '#7c3aed' : centro.tetrapak ? '#f97316' : '#1d6ade'

        return (
          <Fragment key={`centro-${centro.id}`}>
            <Marker
              position={{ lat: centro.lat, lng: centro.lng }}
              onClick={() => onMarkerClick && onMarkerClick(centro)}
              icon={{
                path: window.google.maps.SymbolPath.CIRCLE,
                fillColor: markerColor,
                fillOpacity: 1,
                strokeColor: '#ffffff',
                strokeOpacity: 1,
                strokeWeight: 2,
                scale: isSelected ? 10 : 8,
              }}
            />

            {showGeofencing && (
              <Circle
                center={{ lat: centro.lat, lng: centro.lng }}
                radius={Number(centro.geofenceRadius ?? DEFAULT_GEOFENCE_RADIUS)}
                options={{
                  strokeColor: markerColor,
                  strokeOpacity: 0.8,
                  strokeWeight: 1.5,
                  fillColor: markerColor,
                  fillOpacity: 0.12,
                }}
              />
            )}
          </Fragment>
        )
      })}

      {showTransportistas && transportistas.map((transportista, index) => (
        <Marker
          key={transportista.id}
          position={transportista.position}
          onClick={() => setSelectedTransportista(transportista)}
          label={{
            text: `T${index + 1}`,
            color: '#ffffff',
            fontSize: '10px',
            fontWeight: '700',
          }}
          icon={{
            path: window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
            fillColor: '#0d9488',
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeOpacity: 1,
            strokeWeight: 1.5,
            scale: 5,
            rotation: ((transportista.angle * 180) / Math.PI + 90) % 360,
          }}
        />
      ))}

      {showTransportistas && selectedTransportista && (
        <InfoWindow
          position={selectedTransportista.position}
          onCloseClick={() => setSelectedTransportista(null)}
        >
          <div className="text-xs text-gray-700 leading-relaxed">
            <p className="font-semibold text-gray-900">{selectedTransportista.name}</p>
            <p>Estado: En ruta</p>
            <p>Actualización GPS: tiempo real (mock)</p>
          </div>
        </InfoWindow>
      )}
    </GoogleMap>
  )
}
