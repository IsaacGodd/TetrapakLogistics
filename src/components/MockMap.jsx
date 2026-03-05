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

export default function MockMap({ centros, onMarkerClick, showGeofencing = false, selectedCentro = null, height = '100%' }) {
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const markersRef = useRef([])
  const circlesRef = useRef([])

  useEffect(() => {
    if (mapInstanceRef.current) return

    // Center on Monterrey
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

  // Update markers when centros change
  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map) return

    // Clear existing markers & circles
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
          ${centro.tetrapak ? '<span style="background:#FEF3C7;color:#D97706;font-size:10px;padding:2px 8px;border-radius:99px;font-weight:600;">+ Tetrapak</span>' : '<span style="background:#F3F4F6;color:#6B7280;font-size:10px;padding:2px 8px;border-radius:99px;">Sin Tetrapak</span>'}
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
      marker.on('click', () => {
        onMarkerClick && onMarkerClick(centro)
      })
      marker.addTo(map)
      markersRef.current.push(marker)

      // Geofencing circle
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

  return (
    <div ref={mapRef} style={{ width: '100%', height, minHeight: 300, zIndex: 0 }} />
  )
}
