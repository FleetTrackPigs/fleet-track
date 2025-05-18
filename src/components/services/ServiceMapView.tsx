import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet-routing-machine'
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css'

// Use a direct import for marker icons to avoid the common Leaflet marker issue
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'
import markerIconRetina from 'leaflet/dist/images/marker-icon-2x.png'

// Fix for Leaflet's default icon path issues
// Set the default icon options directly with the correct icon URLs
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIconRetina,
  shadowUrl: markerShadow
})

interface ServiceMapViewProps {
  startLat: number
  startLng: number
  endLat: number
  endLng: number
  startLabel?: string
  endLabel?: string
}

const ServiceMapView = ({
  startLat,
  startLng,
  endLat,
  endLng,
  startLabel = 'Origen',
  endLabel = 'Destino'
}: ServiceMapViewProps) => {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)

  useEffect(() => {
    if (!mapRef.current) return

    // Only initialize the map once
    if (!mapInstanceRef.current) {
      // Create the map
      const map = L.map(mapRef.current, {
        center: [(startLat + endLat) / 2, (startLng + endLng) / 2],
        zoom: 5
      })

      // Add the tile layer (OpenStreetMap)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map)

      // Create start marker (green)
      const startMarker = L.marker([startLat, startLng], {
        icon: L.divIcon({
          html: `<div class="flex items-center justify-center w-8 h-8 rounded-full bg-green-600 border-2 border-white">
                  <div class="w-2 h-2 rounded-full bg-white"></div>
                </div>`,
          className: 'custom-div-icon',
          iconSize: [30, 30],
          iconAnchor: [15, 15]
        })
      }).addTo(map)

      // Create end marker (red)
      const endMarker = L.marker([endLat, endLng], {
        icon: L.divIcon({
          html: `<div class="flex items-center justify-center w-8 h-8 rounded-full bg-red-600 border-2 border-white">
                  <div class="w-2 h-2 rounded-full bg-white"></div>
                </div>`,
          className: 'custom-div-icon',
          iconSize: [30, 30],
          iconAnchor: [15, 15]
        })
      }).addTo(map)

      // Add popups with labels
      startMarker.bindPopup(`<b>${startLabel}</b>`).openPopup()
      endMarker.bindPopup(`<b>${endLabel}</b>`)

      // Draw a line between the two points
      const routeLine = L.polyline(
        [
          [startLat, startLng],
          [endLat, endLng]
        ],
        {
          color: '#6366F1',
          weight: 4,
          opacity: 0.7,
          lineJoin: 'round'
        }
      ).addTo(map)

      // Fit the map to the bounds of the markers
      const bounds = L.latLngBounds([
        [startLat, startLng],
        [endLat, endLng]
      ])
      map.fitBounds(bounds, { padding: [50, 50] })

      // Store the map instance
      mapInstanceRef.current = map
    } else {
      // If map already exists, update markers and route
      const map = mapInstanceRef.current
      map.eachLayer(layer => {
        if (layer instanceof L.Marker || layer instanceof L.Polyline) {
          map.removeLayer(layer)
        }
      })

      // Create start marker (green)
      const startMarker = L.marker([startLat, startLng], {
        icon: L.divIcon({
          html: `<div class="flex items-center justify-center w-8 h-8 rounded-full bg-green-600 border-2 border-white">
                  <div class="w-2 h-2 rounded-full bg-white"></div>
                </div>`,
          className: 'custom-div-icon',
          iconSize: [30, 30],
          iconAnchor: [15, 15]
        })
      }).addTo(map)

      // Create end marker (red)
      const endMarker = L.marker([endLat, endLng], {
        icon: L.divIcon({
          html: `<div class="flex items-center justify-center w-8 h-8 rounded-full bg-red-600 border-2 border-white">
                  <div class="w-2 h-2 rounded-full bg-white"></div>
                </div>`,
          className: 'custom-div-icon',
          iconSize: [30, 30],
          iconAnchor: [15, 15]
        })
      }).addTo(map)

      // Add popups with labels
      startMarker.bindPopup(`<b>${startLabel}</b>`).openPopup()
      endMarker.bindPopup(`<b>${endLabel}</b>`)

      // Draw a line between the two points
      L.polyline(
        [
          [startLat, startLng],
          [endLat, endLng]
        ],
        {
          color: '#6366F1',
          weight: 4,
          opacity: 0.7,
          lineJoin: 'round'
        }
      ).addTo(map)

      // Fit the map to the bounds of the markers
      const bounds = L.latLngBounds([
        [startLat, startLng],
        [endLat, endLng]
      ])
      map.fitBounds(bounds, { padding: [50, 50] })
    }

    // Cleanup function
    return () => {
      // We don't actually destroy the map here to avoid re-creating it
      // on every prop change; we'll handle updates by updating the markers
    }
  }, [startLat, startLng, endLat, endLng, startLabel, endLabel])

  return <div ref={mapRef} className="h-full w-full" />
}

export default ServiceMapView
