import { useNavigate } from 'react-router-dom'
import { useFleet } from '@/contexts/FleetContext'
import { useAuth } from '@/contexts/AuthContext'
import AdminLayout from '@/components/layout/AdminLayout'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Users,
  Truck,
  ArrowRightLeft,
  Map,
  Fuel,
  AlertTriangle,
  MapPin,
  BarChart3,
  Car,
  User,
  Wrench,
  CheckCircle2
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useEffect, useState } from 'react'
import { vehicleReviewsApi } from '@/services/api'
import { Link } from 'react-router-dom'
import { VehicleStatusBadge } from '@/components/fleet/VehicleStatusBadge'

type MaintenanceVehicle = {
  vehicle_id: string
  brand: string
  model: string
  plate: string
  latest_review_id: string
  latest_review_date: string
  issues_noted: string | null
}

// Update the Vehicle type to include 'maintenance' status
type VehicleStatus = 'available' | 'assigned' | 'maintenance'

const AdminDashboard = () => {
  const { drivers, vehicles, getAvailableVehicles } = useFleet()
  const { token } = useAuth()
  const navigate = useNavigate()
  const [vehiclesInMaintenance, setVehiclesInMaintenance] = useState<
    MaintenanceVehicle[]
  >([])
  const [loading, setLoading] = useState(true)

  const activeDrivers = drivers.filter(d => d.status === 'active')
  const availableVehicles = getAvailableVehicles()
  const assignedVehicles = vehicles.filter(v => v.status === 'assigned').length
  const maintenanceVehicles = vehicles.filter(
    v => v.status === ('maintenance' as VehicleStatus)
  ).length

  // Calculate some fake metrics for the dashboard map section
  const getCityDistribution = () => {
    // Create a random distribution of vehicles across cities
    const cities = [
      {
        name: 'Madrid',
        count: Math.floor(Math.random() * assignedVehicles * 0.5) + 1
      },
      {
        name: 'Barcelona',
        count: Math.floor(Math.random() * assignedVehicles * 0.4) + 1
      },
      {
        name: 'Valencia',
        count: Math.floor(Math.random() * assignedVehicles * 0.3) + 1
      },
      {
        name: 'Sevilla',
        count: Math.floor(Math.random() * assignedVehicles * 0.2) + 1
      }
    ]
    // Ensure the total doesn't exceed the number of vehicles
    const total = cities.reduce((sum, city) => sum + city.count, 0)
    if (total > assignedVehicles) {
      // Adjust proportionally
      const factor = assignedVehicles / total
      cities.forEach(city => {
        city.count = Math.max(1, Math.floor(city.count * factor))
      })
    }
    return cities
  }

  const cities = getCityDistribution()

  // Random metrics for the dashboard
  const dailyMetrics = {
    activeVehicles: Math.min(
      assignedVehicles,
      Math.floor(Math.random() * assignedVehicles + 1)
    ),
    totalDistance: Math.floor(Math.random() * 1000) + 4000 // total km today
  }

  // Fetch vehicles requiring maintenance
  useEffect(() => {
    const fetchMaintenanceVehicles = async () => {
      if (!token) return

      try {
        setLoading(true)
        const data = (await vehicleReviewsApi.getVehiclesRequiringMaintenance(
          token
        )) as MaintenanceVehicle[]
        setVehiclesInMaintenance(data)
      } catch (error) {
        console.error('Error fetching maintenance vehicles:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchMaintenanceVehicles()
  }, [token])

  return (
    <AdminLayout>
      <div className="py-6">
        <div className="mb-6 lg:mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Panel de Administración
          </h2>
          <p className="text-muted-foreground">
            Gestiona conductores, vehículos y asignaciones
          </p>
        </div>

        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          <Card className="dashboard-card hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">Conductores</CardTitle>
                <Users className="h-8 w-8 text-primary" />
              </div>
              <CardDescription>Gestión de conductores</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mt-2 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Total de conductores:
                  </span>
                  <span className="font-medium">{drivers.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Conductores activos:
                  </span>
                  <span className="font-medium">{activeDrivers.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Conductores inactivos:
                  </span>
                  <span className="font-medium">
                    {drivers.length - activeDrivers.length}
                  </span>
                </div>
              </div>
              <Button
                className="mt-4 w-full"
                onClick={() => navigate('/admin/drivers')}
              >
                Ver conductores
              </Button>
            </CardContent>
          </Card>

          <Card className="dashboard-card hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">Vehículos</CardTitle>
                <Truck className="h-8 w-8 text-primary" />
              </div>
              <CardDescription>Gestión de vehículos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mt-2 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Total de vehículos:
                  </span>
                  <span className="font-medium">{vehicles.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Vehículos disponibles:
                  </span>
                  <span className="font-medium">
                    {availableVehicles.length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Vehículos asignados:
                  </span>
                  <span className="font-medium">{assignedVehicles}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Vehículos en mantenimiento:
                  </span>
                  <span className="font-medium">{maintenanceVehicles}</span>
                </div>
              </div>
              <Button
                className="mt-4 w-full"
                onClick={() => navigate('/admin/vehicles')}
              >
                Ver vehículos
              </Button>
            </CardContent>
          </Card>

          <Card className="dashboard-card hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">Asignaciones</CardTitle>
                <ArrowRightLeft className="h-8 w-8 text-primary" />
              </div>
              <CardDescription>Asignación de vehículos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mt-2 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Vehículos asignados:
                  </span>
                  <span className="font-medium">{assignedVehicles}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Conductores con vehículo:
                  </span>
                  <span className="font-medium">
                    {drivers.filter(d => d.vehicleid).length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Tasa de utilización:
                  </span>
                  <span className="font-medium">
                    {vehicles.length > 0
                      ? `${Math.round(
                          (assignedVehicles / vehicles.length) * 100
                        )}%`
                      : '0%'}
                  </span>
                </div>
              </div>
              <Button
                className="mt-4 w-full"
                onClick={() => navigate('/admin/assign')}
              >
                Gestionar asignaciones
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8">
          <Card className="hover:shadow-md transition-shadow overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                <div>
                  <CardTitle className="text-xl flex items-center gap-2">
                    Monitorización de Flota
                    <Map className="h-6 w-6 text-primary" />
                  </CardTitle>
                  <CardDescription>
                    Seguimiento en tiempo real de tus vehículos
                  </CardDescription>
                </div>
                {dailyMetrics.activeVehicles > 0 && (
                  <Badge
                    variant="destructive"
                    className="flex items-center mt-2 sm:mt-0 w-fit"
                  >
                    <AlertTriangle className="h-4 w-4 mr-1" />
                    {dailyMetrics.activeVehicles}{' '}
                    {dailyMetrics.activeVehicles === 1
                      ? 'vehículo activo'
                      : 'vehículos activos'}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-2">
                <div className="md:col-span-2 h-32 md:h-64 bg-slate-100 rounded-lg overflow-hidden relative">
                  {/* Map preview (static image that mimics our Leaflet map) */}
                  <div className="absolute inset-0 bg-[#f2f6f9] overflow-hidden">
                    <svg
                      viewBox="0 0 800 400"
                      className="w-full h-full"
                      preserveAspectRatio="xMidYMid slice"
                    >
                      {/* Simplified map background */}
                      <path
                        d="M0,200 Q200,180 400,200 T800,200 L800,400 L0,400 Z"
                        fill="#e9eff5"
                        stroke="#d0dbe7"
                        strokeWidth="1"
                      />
                      <path
                        d="M0,250 Q200,230 400,250 T800,250 L800,400 L0,400 Z"
                        fill="#dfe8f2"
                        stroke="#c4d4e5"
                        strokeWidth="1"
                      />

                      {/* Major roads */}
                      <path
                        d="M100,50 L700,350"
                        stroke="#c0d0e0"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        d="M50,300 L750,100"
                        stroke="#c0d0e0"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        d="M400,50 L400,350"
                        stroke="#c0d0e0"
                        strokeWidth="4"
                        fill="none"
                      />

                      {/* Vehicle dots */}
                      {Array.from({ length: assignedVehicles }).map((_, i) => {
                        const x = 100 + Math.random() * 600
                        const y = 100 + Math.random() * 200
                        return (
                          <g key={i}>
                            <circle
                              cx={x}
                              cy={y}
                              r="8"
                              fill="#3b82f6"
                              opacity="0.8"
                            />
                            <circle
                              cx={x}
                              cy={y}
                              r="12"
                              fill="#3b82f6"
                              opacity="0.3"
                            />
                          </g>
                        )
                      })}

                      {/* City markers */}
                      <g transform="translate(300, 150)">
                        <circle r="6" fill="#1e40af" />
                        <text
                          x="10"
                          y="4"
                          fontSize="12"
                          fill="#1e40af"
                          fontWeight="bold"
                        >
                          Madrid
                        </text>
                      </g>
                      <g transform="translate(550, 120)">
                        <circle r="5" fill="#1e40af" />
                        <text
                          x="10"
                          y="4"
                          fontSize="12"
                          fill="#1e40af"
                          fontWeight="bold"
                        >
                          Barcelona
                        </text>
                      </g>
                      <g transform="translate(450, 220)">
                        <circle r="4" fill="#1e40af" />
                        <text
                          x="10"
                          y="4"
                          fontSize="12"
                          fill="#1e40af"
                          fontWeight="bold"
                        >
                          Valencia
                        </text>
                      </g>
                      <g transform="translate(200, 250)">
                        <circle r="4" fill="#1e40af" />
                        <text
                          x="10"
                          y="4"
                          fontSize="12"
                          fill="#1e40af"
                          fontWeight="bold"
                        >
                          Sevilla
                        </text>
                      </g>
                    </svg>

                    {/* Overlay */}
                    <div className="absolute bottom-0 right-0 p-2 text-xs text-slate-500">
                      Vista previa del mapa • Datos simulados
                    </div>

                    {/* "Live" marker showing animation */}
                    <div className="absolute top-3 left-3 bg-white bg-opacity-80 rounded-full px-2 py-1 flex items-center shadow-sm">
                      <span className="animate-ping absolute h-2 w-2 rounded-full bg-red-600 opacity-75"></span>
                      <span className="relative h-2 w-2 rounded-full bg-red-700"></span>
                      <span className="ml-3 text-xs font-medium">
                        Actualización en tiempo real
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-semibold mb-2 flex items-center">
                      <MapPin className="h-4 w-4 mr-1 text-blue-600" />
                      Distribución por Ciudades
                    </h3>
                    <div className="space-y-2">
                      {cities.map(city => (
                        <div key={city.name} className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span>{city.name}</span>
                            <span className="font-medium">
                              {city.count} vehículos
                            </span>
                          </div>
                          <Progress
                            value={(city.count / assignedVehicles) * 100}
                            className="h-1.5"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold mb-2 flex items-center">
                      <BarChart3 className="h-4 w-4 mr-1 text-indigo-600" />
                      Métricas de Rendimiento
                    </h3>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-green-50 rounded-md p-2">
                        <div className="flex items-center justify-between text-green-800">
                          <span>Distancia total</span>
                          <span className="font-bold">
                            {dailyMetrics.totalDistance} km
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <Button
                className="w-full mt-4"
                onClick={() => navigate('/admin/map')}
              >
                Ver mapa detallado
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Maintenance Section */}
        <div className="mt-6 grid gap-4 md:grid-cols-1">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xl flex items-center gap-2">
                <Wrench className="h-5 w-5 text-amber-500" />
                Vehículos que requieren mantenimiento
              </CardTitle>
              <CardDescription>
                Revisiones recientes con problemas detectados
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-muted-foreground text-sm">
                  Cargando datos...
                </p>
              ) : vehiclesInMaintenance.length === 0 ? (
                <div className="flex items-center gap-2 rounded-lg border border-dashed p-4 text-muted-foreground">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <p>
                    No hay vehículos que requieran mantenimiento en este
                    momento.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {vehiclesInMaintenance.map(vehicle => (
                    <div
                      key={vehicle.vehicle_id}
                      className="rounded-lg border p-4 hover:bg-muted/50"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-amber-500" />
                            <h3 className="font-medium">
                              {vehicle.brand} {vehicle.model} ({vehicle.plate})
                            </h3>
                          </div>

                          {vehicle.issues_noted && (
                            <p className="text-sm text-muted-foreground">
                              <span className="font-medium">
                                Problema reportado:
                              </span>{' '}
                              {vehicle.issues_noted}
                            </p>
                          )}

                          <p className="text-xs text-muted-foreground">
                            Revisión realizada:{' '}
                            {new Date(
                              vehicle.latest_review_date
                            ).toLocaleString()}
                          </p>
                        </div>

                        <Link
                          to={`/admin/vehicles/${vehicle.vehicle_id}`}
                          className="sm:ml-auto"
                        >
                          <Button variant="outline" size="sm">
                            Ver detalles
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}

                  <Link to="/admin/vehicles">
                    <Button variant="outline" className="w-full">
                      Ver todos los vehículos
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  )
}

export default AdminDashboard
