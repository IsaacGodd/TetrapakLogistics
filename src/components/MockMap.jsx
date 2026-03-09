import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix Leaflet default icon paths with Vite
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

function makeIcon(color) {
  return L.divIcon({
    className: '',
    html: `<div style="
      width: 28px; height: 28px;
      background: ${color};
      border: 3px solid white;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      box-shadow: 2px 2px 6px rgba(0,0,0,0.3);
    "></div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -28],
  })
}

function makeTruckIcon(color, isSelected = false) {
  return L.divIcon({
    className: '',
    html: `<div style="
      width: 34px; height: 34px;
      background: ${color};
      border: ${isSelected ? '3px solid #1D6ADE' : '3px solid white'};
      border-radius: 8px;
      display: flex; align-items: center; justify-content: center;
      box-shadow: ${isSelected ? '0 0 0 3px rgba(29,106,222,0.4), 2px 2px 10px rgba(0,0,0,0.5)' : '2px 2px 8px rgba(0,0,0,0.4)'};
      font-size: 16px;
      line-height: 1;
      transform: ${isSelected ? 'scale(1.2)' : 'scale(1)'};
      transition: transform 0.2s;
    ">🚛</div>`,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
    popupAnchor: [0, -20],
  })
}

export default function MockMap({
  centros,
  onMarkerClick,
  showGeofencing = false,
  selectedCentro = null,
  height = '100%',
  // Optional props (backward compatible — all default to safe no-ops)
  transportistas = [],
  routePolylines = [],
  showRouteLine = false,
  onTransportistaClick = null,
  selectedTransportistaId = null,
}) {
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const markersRef = useRef([])
  const circlesRef = useRef([])
  const truckMarkersRef = useRef([])
  const routeLinesRef = useRef([])

  // Initialize map once
  useEffect(() => {
    if (mapInstanceRef.current) return

    const map = L.map(mapRef.current, {
      center: [25.6866, -100.3161],
      zoom: 11,
      zoomControl: true,
    })

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 18,
    }).addTo(map)

    mapInstanceRef.current = map
    return () => {
      map.remove()
      mapInstanceRef.current = null
    }
  }, [])

  // Update centro markers and geofencing circles
  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map) return

    markersRef.current.forEach(m => m.remove())
    circlesRef.current.forEach(c => c.remove())
    markersRef.current = []
    circlesRef.current = []

    if (!centros || centros.length === 0) return

    centros.forEach(centro => {
      const isSelected = selectedCentro?.id === centro.id
      const color = isSelected ? '#8B5CF6' : centro.tetrapak ? '#F97316' : '#3B82F6'

      const marker = L.marker([centro.lat, centro.lng], { icon: makeIcon(color) })

      const popupHtml = `
        <div style="min-width:180px;font-family:Inter,sans-serif;">
          <div style="font-weight:700;font-size:13px;color:#1f2937;margin-bottom:4px;">${centro.nombre}</div>
          ${centro.tetrapak
            ? '<span style="background:#FEF3C7;color:#D97706;font-size:10px;padding:2px 8px;border-radius:99px;font-weight:600;">+ Tetrapak</span>'
            : '<span style="background:#F3F4F6;color:#6B7280;font-size:10px;padding:2px 8px;border-radius:99px;">Sin Tetrapak</span>'}
          <div style="margin-top:8px;font-size:11px;color:#6B7280;">
            <div>🕐 ${centro.horario}</div>
            <div>📍 ${centro.direccion}</div>
            <div>📞 ${centro.telefono}</div>
            <div>📦 ${centro.materiales.join(', ')}</div>
            <div>📅 ${centro.dias.join(', ')}</div>
          </div>
          <div style="margin-top:8px;font-size:11px;color:#1D6ADE;">
            Capacidad: ${centro.capacidad} ton/sem
          </div>
        </div>
      `
      marker.bindPopup(popupHtml, { maxWidth: 260 })
      marker.on('click', () => { onMarkerClick && onMarkerClick(centro) })
      marker.addTo(map)
      markersRef.current.push(marker)

      if (showGeofencing) {
        const circle = L.circle([centro.lat, centro.lng], {
          radius: 500,
          color: color,
          fillColor: color,
          fillOpacity: 0.08,
          weight: 1.5,
          dashArray: '4 4',
        }).addTo(map)
        circlesRef.current.push(circle)
      }
    })
  }, [centros, selectedCentro, showGeofencing])

  // Pan to selected centro
  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map || !selectedCentro) return
    map.setView([selectedCentro.lat, selectedCentro.lng], 14, { animate: true })
  }, [selectedCentro])

  // Update truck markers on every GPS tick
  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map) return

    truckMarkersRef.current.forEach(m => m.remove())
    truckMarkersRef.current = []

    if (!transportistas || transportistas.length === 0) return

    const estadoLabel = {
      en_ruta: 'En Ruta',
      en_centro: 'En Centro',
      descansando: 'Descansando',
      sin_asignar: 'Sin Asignar',
    }

    transportistas.forEach(t => {
      const isSelected = t.id === selectedTransportistaId
      const icon = makeTruckIcon(t.color, isSelected)
      const marker = L.marker([t.lat, t.lng], { icon, zIndexOffset: isSelected ? 1000 : 0 })

      const routeInfo = t.rutaAsignada?.length > 0
        ? `<div style="margin-top:4px;font-size:11px;color:#6B7280;">
             Ruta: ${Math.min(t._stepIndex ?? 0, t.rutaAsignada.length)}/${t.rutaAsignada.length} paradas
           </div>`
        : '<div style="margin-top:4px;font-size:11px;color:#9CA3AF;">Sin ruta asignada</div>'

      marker.bindPopup(`
        <div style="min-width:160px;font-family:Inter,sans-serif;">
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px;">
            <span style="width:10px;height:10px;background:${t.color};border-radius:50%;display:inline-block;"></span>
            <div style="font-weight:700;font-size:13px;color:#1f2937;">${t.nombre}</div>
          </div>
          <div style="font-size:11px;color:#6B7280;">${t.vehiculo} · ${t.placa}</div>
          <div style="margin-top:6px;">
            <span style="background:#F3F4F6;color:#374151;font-size:10px;padding:2px 8px;border-radius:99px;font-weight:600;">
              ${estadoLabel[t.estado] ?? t.estado}
            </span>
          </div>
          ${routeInfo}
        </div>
      `, { maxWidth: 220 })

      marker.on('click', () => { onTransportistaClick?.(t) })
      marker.addTo(map)
      truckMarkersRef.current.push(marker)
    })
  }, [transportistas, selectedTransportistaId, onTransportistaClick])

  // Draw route polylines
  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map) return

    routeLinesRef.current.forEach(l => l.remove())
    routeLinesRef.current = []

    if (!showRouteLine || !routePolylines || routePolylines.length === 0) return

    routePolylines.forEach(({ coordinates, color = '#1D6ADE', weight = 5, opacity = 0.85 }) => {
      if (!coordinates || coordinates.length < 2) return
      const line = L.polyline(coordinates, {
        color,
        weight,
        opacity,
        lineJoin: 'round',
        lineCap: 'round',
      }).addTo(map)
      routeLinesRef.current.push(line)
    })
  }, [routePolylines, showRouteLine])

  return (
    <div ref={mapRef} style={{ width: '100%', height, minHeight: 300, zIndex: 0 }} />
  )
}
