import { useState, useEffect, useRef } from 'react'
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap
} from 'react-leaflet'
import L from 'leaflet'
import { useFleet } from '@/contexts/FleetContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  CarFront,
  Fuel,
  Gauge,
  Clock,
  Route,
  AlertTriangle
} from 'lucide-react'
import { Vehicle } from '@/types/fleet'
import { Button } from '@/components/ui/button'
import 'leaflet/dist/leaflet.css'
import { secureRandom, secureRandomInt } from '@/lib/utils'

// Create custom icons for vehicles
const createVehicleIcon = (status: 'available' | 'assigned') => {
  return L.divIcon({
    className: 'custom-vehicle-icon',
    html: `<div class="flex items-center justify-center w-8 h-8 rounded-full ${
      status === 'assigned' ? 'bg-green-500' : 'bg-amber-500'
    } shadow-lg">
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-car-front">
        <path d="M7 17a2 2 0 1 0 4 0H7z"/>
        <path d="M14 17a2 2 0 1 0 4 0h-4z"/>
        <path d="M10 9h4"/>
        <path d="M10 9v4a2 2 0 0 0 4 0V9"/>
        <rect width="18" height="9" x="3" y="8" rx="2"/>
        <path d="M5 8V6a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v2"/>
        <path d="M7 14v.01"/>
        <path d="M17 14v.01"/>
      </svg>
    </div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16]
  })
}

// Generate random Spain locations
const generateRandomSpainLocation = () => {
  // Spain boundaries (approximate)
  const minLat = 36.0
  const maxLat = 43.8
  const minLng = -9.4
  const maxLng = 3.3

  // Bias towards major cities
  const cities = [
    { name: 'Madrid', lat: 40.4168, lng: -3.7038 },
    { name: 'Barcelona', lat: 41.3851, lng: 2.1734 },
    { name: 'Valencia', lat: 39.4699, lng: -0.3763 },
    { name: 'Sevilla', lat: 37.3891, lng: -5.9845 },
    { name: 'Zaragoza', lat: 41.6488, lng: -0.8891 },
    { name: 'Málaga', lat: 36.7213, lng: -4.4213 }
  ]

  // 70% chance to be near a city
  if (secureRandom() < 0.7) {
    const city = cities[secureRandomInt(0, cities.length)]
    // Add some randomness around the city
    return {
      lat: city.lat + (secureRandom() * 0.4 - 0.2),
      lng: city.lng + (secureRandom() * 0.4 - 0.2),
      nearCity: city.name
    }
  }

  // Otherwise, random location in Spain
  return {
    lat: minLat + secureRandom() * (maxLat - minLat),
    lng: minLng + secureRandom() * (maxLng - minLng),
    nearCity: 'Rural'
  }
}

// Generate a semi-realistic route between two points
const generateRoute = (
  start: L.LatLngExpression,
  end: L.LatLngExpression,
  pointCount = 10
) => {
  const points = [start]
  const [startLat, startLng] = Array.isArray(start)
    ? start
    : [start.lat, start.lng]
  const [endLat, endLng] = Array.isArray(end) ? end : [end.lat, end.lng]

  // Create path with some randomness to simulate roads
  for (let i = 1; i <= pointCount; i++) {
    const ratio = i / (pointCount + 1)
    const lat = startLat + (endLat - startLat) * ratio
    const lng = startLng + (endLng - startLng) * ratio

    // Add some randomness to make the route look like roads
    const randomFactor = Math.min(0.05, Math.abs(endLat - startLat) * 0.2)
    const jitter = secureRandom() * randomFactor * 2 - randomFactor

    points.push([lat + jitter, lng + jitter])
  }

  points.push(end)
  return points
}

// Generate random vehicle telemetry data
const generateVehicleTelemetry = (vehicle: Vehicle) => {
  // Trucks have different characteristics than cars
  const isTruck =
    vehicle.model.toLowerCase().includes('truck') ||
    vehicle.brand.toLowerCase().includes('iveco')

  return {
    speed: secureRandomInt(20, isTruck ? 50 : 80), // km/h
    fuel: secureRandomInt(20, 100), // percentage
    odometer: secureRandomInt(5000, 105000), // km
    engineTemp: secureRandomInt(60, 100), // Celsius
    lastMaintenance: secureRandomInt(10, 100), // days ago
    fuelConsumption: isTruck
      ? (secureRandom() * 10 + 20).toFixed(1) // L/100km for trucks
      : (secureRandom() * 5 + 6).toFixed(1), // L/100km for cars
    status: secureRandom() > 0.9 ? 'warning' : 'normal',
    warnings: secureRandom() > 0.9 ? ['Neumáticos con baja presión'] : []
  }
}

interface VehicleMarker extends Vehicle {
  position: { lat: number; lng: number; nearCity: string }
  route?: L.LatLngExpression[]
  destination?: { lat: number; lng: number; nearCity: string }
  telemetry: ReturnType<typeof generateVehicleTelemetry>
  lastUpdated: Date
}

// Component to auto-center map
const MapController = ({ center }: { center: L.LatLngExpression }) => {
  const map = useMap()
  useEffect(() => {
    map.setView(center, map.getZoom())
  }, [center, map])
  return null
}

export const VehicleMap = () => {
  const { vehicles, getVehicleDriver } = useFleet()
  const [vehicleMarkers, setVehicleMarkers] = useState<VehicleMarker[]>([])
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleMarker | null>(
    null
  )
  const [centerPosition, setCenterPosition] = useState<L.LatLngExpression>([
    40.4168, -3.7038
  ]) // Madrid
  const mapRef = useRef<L.Map | null>(null)

  // Generate initial vehicle data
  useEffect(() => {
    const markers = vehicles.map(vehicle => {
      const position = generateRandomSpainLocation()
      const telemetry = generateVehicleTelemetry(vehicle)

      // For assigned vehicles, generate a destination and route
      let destination
      let route

      if (vehicle.status === 'assigned') {
        destination = generateRandomSpainLocation()
        route = generateRoute(
          [position.lat, position.lng],
          [destination.lat, destination.lng]
        )
      }

      return {
        ...vehicle,
        position,
        destination,
        route,
        telemetry,
        lastUpdated: new Date()
      }
    })

    setVehicleMarkers(markers)

    // Simulation interval - Update positions along routes
    const interval = setInterval(() => {
      setVehicleMarkers(prev =>
        prev.map(marker => {
          // Only move assigned vehicles with routes
          if (
            marker.status === 'assigned' &&
            marker.route &&
            marker.route.length > 1
          ) {
            const routeIndex = marker.route.findIndex(point =>
              Array.isArray(point)
                ? point[0] === marker.position.lat &&
                  point[1] === marker.position.lng
                : point.lat === marker.position.lat &&
                  point.lng === marker.position.lng
            )

            // If we found the current position in the route
            if (routeIndex !== -1 && routeIndex < marker.route.length - 1) {
              const nextPoint = marker.route[routeIndex + 1]
              const newLat = Array.isArray(nextPoint)
                ? nextPoint[0]
                : nextPoint.lat
              const newLng = Array.isArray(nextPoint)
                ? nextPoint[1]
                : nextPoint.lng

              return {
                ...marker,
                position: {
                  lat: newLat,
                  lng: newLng,
                  nearCity: marker.position.nearCity
                },
                telemetry: {
                  ...marker.telemetry,
                  // Randomly adjust speeds
                  speed: Math.max(
                    5,
                    marker.telemetry.speed + (secureRandom() * 10 - 5)
                  )
                },
                lastUpdated: new Date()
              }
            }

            // If we reached the destination, generate a new one
            if (routeIndex === marker.route.length - 1) {
              const newDestination = generateRandomSpainLocation()
              const newRoute = generateRoute(
                [marker.position.lat, marker.position.lng],
                [newDestination.lat, newDestination.lng]
              )

              return {
                ...marker,
                destination: newDestination,
                route: newRoute,
                telemetry: {
                  ...marker.telemetry,
                  fuel: Math.max(5, marker.telemetry.fuel - secureRandom() * 5)
                },
                lastUpdated: new Date()
              }
            }
          }

          // Unassigned vehicles move slightly randomly
          if (marker.status === 'available' && secureRandom() > 0.7) {
            return {
              ...marker,
              position: {
                lat: marker.position.lat + (secureRandom() * 0.02 - 0.01),
                lng: marker.position.lng + (secureRandom() * 0.02 - 0.01),
                nearCity: marker.position.nearCity
              },
              lastUpdated: new Date()
            }
          }

          return marker
        })
      )
    }, 2000)

    return () => clearInterval(interval)
  }, [vehicles])

  // Update center when a vehicle is selected
  useEffect(() => {
    if (selectedVehicle) {
      setCenterPosition([
        selectedVehicle.position.lat,
        selectedVehicle.position.lng
      ])
    }
  }, [selectedVehicle])

  // Function to follow a specific vehicle
  const handleFollowVehicle = (vehicle: VehicleMarker) => {
    setSelectedVehicle(vehicle)
    if (mapRef.current) {
      mapRef.current.setView([vehicle.position.lat, vehicle.position.lng], 13)
    }
  }

  return (
    <div className="flex flex-col space-y-4">
      <div className="relative w-full h-[500px] rounded-lg overflow-hidden shadow-md">
        <MapContainer
          center={centerPosition}
          zoom={6}
          style={{ height: '100%', width: '100%' }}
          whenReady={map => {
            mapRef.current = map
          }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Vehicle markers */}
          {vehicleMarkers.map(vehicle => (
            <Marker
              key={vehicle.id}
              position={[vehicle.position.lat, vehicle.position.lng]}
              icon={createVehicleIcon(vehicle.status === 'assigned' ? 'assigned' : 'available')}
              eventHandlers={{
                click: () => handleFollowVehicle(vehicle)
              }}
            >
              <Popup>
                <div className="p-1">
                  <h3 className="font-bold">
                    {vehicle.brand} {vehicle.model}
                  </h3>
                  <p className="text-sm">{vehicle.plate}</p>
                  <p className="text-xs text-muted-foreground">
                    Cerca de: {vehicle.position.nearCity}
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-2 text-xs"
                    onClick={() => handleFollowVehicle(vehicle)}
                  >
                    Ver detalles
                  </Button>
                </div>
              </Popup>
            </Marker>
          ))}

          {/* Route lines for assigned vehicles */}
          {vehicleMarkers
            .filter(v => v.status === 'assigned' && v.route)
            .map(vehicle => (
              <Polyline
                key={`route-${vehicle.id}`}
                positions={vehicle.route || []}
                color={
                  vehicle.id === selectedVehicle?.id ? '#3b82f6' : '#94a3b8'
                }
                weight={vehicle.id === selectedVehicle?.id ? 4 : 2}
                opacity={vehicle.id === selectedVehicle?.id ? 0.8 : 0.5}
                dashArray={vehicle.id === selectedVehicle?.id ? '' : '5, 5'}
              />
            ))}

          {/* Auto-center when following a vehicle */}
          {selectedVehicle && (
            <MapController
              center={[
                selectedVehicle.position.lat,
                selectedVehicle.position.lng
              ]}
            />
          )}
        </MapContainer>
      </div>

      {/* Vehicle detail panel */}
      {selectedVehicle && (
        <Card className="border-l-4 border-primary">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-xl">
                  {selectedVehicle.brand} {selectedVehicle.model}
                  <span className="ml-2 text-sm inline-flex items-center px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800">
                    {selectedVehicle.plate}
                  </span>
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {selectedVehicle.status === 'assigned' ? (
                    <>
                      <span className="text-green-600 font-medium">
                        Asignado
                      </span>{' '}
                      a{' '}
                      {(() => {
                        const driver = getVehicleDriver(selectedVehicle.id)
                        return driver
                          ? `${driver.name} ${driver.lastname}`
                          : 'Conductor desconocido'
                      })()}
                    </>
                  ) : (
                    <span className="text-amber-600 font-medium">
                      Disponible
                    </span>
                  )}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedVehicle(null)}
              >
                Cerrar
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="flex flex-col items-center justify-center p-2 bg-blue-50 rounded-lg">
                <Gauge className="h-5 w-5 text-blue-600 mb-1" />
                <p className="text-xs text-muted-foreground">Velocidad</p>
                <p className="font-bold text-lg">
                  {Math.round(selectedVehicle.telemetry.speed)} km/h
                </p>
              </div>

              <div className="flex flex-col items-center justify-center p-2 bg-green-50 rounded-lg">
                <Fuel className="h-5 w-5 text-green-600 mb-1" />
                <p className="text-xs text-muted-foreground">Combustible</p>
                <p className="font-bold text-lg">
                  {selectedVehicle.telemetry.fuel}%
                </p>
              </div>

              <div className="flex flex-col items-center justify-center p-2 bg-amber-50 rounded-lg">
                <Route className="h-5 w-5 text-amber-600 mb-1" />
                <p className="text-xs text-muted-foreground">Consumo</p>
                <p className="font-bold text-lg">
                  {selectedVehicle.telemetry.fuelConsumption} L/100km
                </p>
              </div>

              <div className="flex flex-col items-center justify-center p-2 bg-purple-50 rounded-lg">
                <Clock className="h-5 w-5 text-purple-600 mb-1" />
                <p className="text-xs text-muted-foreground">Última act.</p>
                <p className="font-bold text-lg">
                  {Math.floor(
                    (new Date().getTime() -
                      selectedVehicle.lastUpdated.getTime()) /
                      1000
                  )}
                  s
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {selectedVehicle.status === 'assigned' &&
                selectedVehicle.destination && (
                  <div className="border rounded-lg p-3">
                    <h4 className="font-medium text-sm flex items-center">
                      <Route className="h-4 w-4 mr-1" /> Información de ruta
                    </h4>
                    <div className="mt-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Origen:</span>
                        <span>{selectedVehicle.position.nearCity}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Destino:</span>
                        <span>{selectedVehicle.destination.nearCity}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Distancia est.:
                        </span>
                        <span>{secureRandomInt(50, 200)} km</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Llegada est.:
                        </span>
                        <span>
                          {(() => {
                            const now = new Date()
                            now.setMinutes(
                              now.getMinutes() +
                                secureRandomInt(30, 150)
                            )
                            return now.toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            })
                          })()}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

              {selectedVehicle.telemetry.status === 'warning' && (
                <div className="border-2 border-yellow-300 bg-yellow-50 rounded-lg p-3">
                  <h4 className="font-medium text-sm flex items-center text-yellow-700">
                    <AlertTriangle className="h-4 w-4 mr-1" /> Advertencias
                  </h4>
                  <ul className="mt-2 text-sm list-disc pl-5 text-yellow-700">
                    {selectedVehicle.telemetry.warnings.map((warning) => (
                      <li key={warning}>{warning}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="border rounded-lg p-3">
                <h4 className="font-medium text-sm flex items-center">
                  <CarFront className="h-4 w-4 mr-1" /> Datos del vehículo
                </h4>
                <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Odómetro:</span>
                    <span>
                      {selectedVehicle.telemetry.odometer.toLocaleString()} km
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Temp. motor:</span>
                    <span>{selectedVehicle.telemetry.engineTemp}°C</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Último mant.:</span>
                    <span>
                      Hace {selectedVehicle.telemetry.lastMaintenance} días
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Estado:</span>
                    <span
                      className={
                        selectedVehicle.telemetry.status === 'normal'
                          ? 'text-green-600'
                          : 'text-yellow-600'
                      }
                    >
                      {selectedVehicle.telemetry.status === 'normal'
                        ? 'Normal'
                        : 'Atención'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
