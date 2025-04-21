import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useFleet } from '@/contexts/FleetContext'
import AdminLayout from '@/components/layout/AdminLayout'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  ChevronLeft,
  Car,
  Truck,
  User,
  Calendar,
  MapPin,
  ClipboardList,
  AlertTriangle,
  CheckCircle2,
  Wrench,
  History,
  Info,
  Activity,
  Shield,
  ArrowLeft
} from 'lucide-react'
import { VehicleStatusBadge } from '@/components/fleet/VehicleStatusBadge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { vehicleApi, vehicleReviewsApi } from '@/services/api'
import { Vehicle, VehicleReview } from '@/types/fleet'
import { useToast } from '@/components/ui/use-toast'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Fix for default marker icons in Leaflet with React
// @ts-expect-error - Known issue with Leaflet types
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png'
})

// Interface for our enhanced vehicle with reviews and stats
interface EnhancedVehicle extends Vehicle {
  driver?: {
    id: string
    name: string
    lastname: string
  } | null
  reviews?: VehicleReview[]
  position?: {
    lat: number
    lng: number
  }
  stats?: {
    totalKm: number
    fuelEfficiency: number
    maintenanceScore: number
    lastMaintenance: string
  }
}

const VehicleDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { token } = useAuth()
  const { vehicles, drivers, getVehicleDriver } = useFleet()
  const { toast } = useToast()

  const [vehicle, setVehicle] = useState<EnhancedVehicle | null>(null)
  const [reviews, setReviews] = useState<VehicleReview[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  // Fetch vehicle data and reviews
  useEffect(() => {
    const fetchVehicleData = async () => {
      if (!id || !token) return

      setLoading(true)
      try {
        // Get vehicle details
        const vehicleData = (await vehicleApi.getVehicleById(
          id,
          token
        )) as Vehicle

        if (!vehicleData) {
          setLoading(false)
          toast({
            title: 'Error',
            description: 'No se pudo encontrar el vehículo',
            variant: 'destructive'
          })
          return
        }

        // Get vehicle reviews
        const reviewsData = (await vehicleReviewsApi.getByVehicleId(
          id,
          token
        )) as VehicleReview[]

        // Simulate position data
        const simulatedPosition = {
          lat: 40.416775 + (Math.random() * 0.1 - 0.05),
          lng: -3.70379 + (Math.random() * 0.1 - 0.05)
        }

        // Simulate vehicle stats
        const simulatedStats = {
          totalKm: Math.floor(Math.random() * 50000) + 10000,
          fuelEfficiency: Math.floor(Math.random() * 10) + 5,
          maintenanceScore: Math.floor(Math.random() * 100),
          lastMaintenance: new Date(
            Date.now() - Math.floor(Math.random() * 90) * 24 * 60 * 60 * 1000
          ).toISOString()
        }

        // Enhanced vehicle data
        const enhancedVehicle: EnhancedVehicle = {
          ...vehicleData,
          reviews: reviewsData || [],
          position: simulatedPosition,
          stats: simulatedStats
        }

        setVehicle(enhancedVehicle)
        setReviews(Array.isArray(reviewsData) ? reviewsData : [])
      } catch (error) {
        console.error('Error fetching vehicle data:', error)
        toast({
          title: 'Error',
          description: 'No se pudieron cargar los datos del vehículo',
          variant: 'destructive'
        })
      } finally {
        setLoading(false)
      }
    }

    fetchVehicleData()
  }, [id, token, toast])

  if (loading) {
    return (
      <AdminLayout>
        <div className="container py-6">
          <div className="flex items-center mb-6">
            <Button variant="ghost" onClick={() => navigate('/admin/vehicles')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver a vehículos
            </Button>
          </div>
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">
              Cargando datos del vehículo...
            </p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  if (!vehicle) {
    return (
      <AdminLayout>
        <div className="container py-6">
          <div className="flex items-center mb-6">
            <Button variant="ghost" onClick={() => navigate('/admin/vehicles')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver a vehículos
            </Button>
          </div>
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Vehículo no encontrado</CardTitle>
              <CardDescription>
                El vehículo solicitado no existe o no tienes permisos para
                verlo.
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <Button onClick={() => navigate('/admin/vehicles')}>
                Ver todos los vehículos
              </Button>
            </CardFooter>
          </Card>
        </div>
      </AdminLayout>
    )
  }

  // Calculate review health score
  const calculateHealthScore = (reviews: VehicleReview[]) => {
    if (!reviews || reviews.length === 0) return 100

    const lastReview = reviews[0]
    const checksCount = 5 // Total number of check items
    const passedChecks = [
      lastReview.lights_working,
      lastReview.brakes_working,
      lastReview.tires_condition,
      lastReview.fluids_checked,
      lastReview.clean_interior
    ].filter(Boolean).length

    return Math.floor((passedChecks / checksCount) * 100)
  }

  const healthScore = calculateHealthScore(reviews)
  const lastReview = reviews.length > 0 ? reviews[0] : null

  return (
    <AdminLayout>
      <div className="container py-6">
        <div className="flex items-center mb-6">
          <Button variant="ghost" onClick={() => navigate('/admin/vehicles')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a vehículos
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main vehicle info */}
          <Card className="lg:col-span-2">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    {vehicle && vehicle.brand ? (
                      vehicle.brand.toLowerCase().includes('ford') ? (
                        <Car className="h-5 w-5 text-blue-500" />
                      ) : vehicle.brand.toLowerCase().includes('mercedes') ? (
                        <Car className="h-5 w-5 text-slate-700" />
                      ) : (
                        <Truck className="h-5 w-5 text-amber-500" />
                      )
                    ) : (
                      <Truck className="h-5 w-5 text-amber-500" />
                    )}
                    <CardTitle className="text-2xl">
                      {vehicle?.brand} {vehicle?.model}
                    </CardTitle>
                  </div>
                  <CardDescription className="mt-1">
                    Matrícula:{' '}
                    <span className="font-mono font-medium">
                      {vehicle?.plate}
                    </span>
                  </CardDescription>
                </div>
                <VehicleStatusBadge status={vehicle?.status || 'available'} />
              </div>
            </CardHeader>

            <CardContent>
              <Tabs defaultValue="overview" onValueChange={setActiveTab}>
                <TabsList className="w-full">
                  <TabsTrigger value="overview" className="flex-1">
                    <Info className="mr-2 h-4 w-4" />
                    Resumen
                  </TabsTrigger>
                  <TabsTrigger value="maintenance" className="flex-1">
                    <Wrench className="mr-2 h-4 w-4" />
                    Mantenimiento
                  </TabsTrigger>
                  <TabsTrigger value="location" className="flex-1">
                    <MapPin className="mr-2 h-4 w-4" />
                    Ubicación
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="mt-4 space-y-4">
                  <div className="space-y-4">
                    {/* Driver info */}
                    <div className="rounded-lg border p-4">
                      <h3 className="font-medium flex items-center gap-2 mb-2">
                        <User className="h-4 w-4 text-blue-500" />
                        Conductor asignado
                      </h3>
                      {vehicle.driver ? (
                        <div className="space-y-1">
                          <p className="text-sm">
                            <span className="font-medium">Nombre:</span>{' '}
                            {vehicle.driver.name} {vehicle.driver.lastname}
                          </p>
                          <div className="flex justify-end">
                            <Link to={`/admin/drivers/${vehicle.driver.id}`}>
                              <Button size="sm" variant="outline">
                                Ver perfil
                              </Button>
                            </Link>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-muted rounded-md p-2 text-sm text-muted-foreground">
                          Este vehículo no tiene conductor asignado actualmente.
                        </div>
                      )}
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="rounded-lg border p-4 space-y-2">
                        <h3 className="font-medium flex items-center gap-2">
                          <Activity className="h-4 w-4 text-blue-500" />
                          Datos de Uso
                        </h3>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <p className="text-muted-foreground">
                              Kilómetros totales
                            </p>
                            <p className="font-medium">
                              {vehicle?.stats?.totalKm
                                ? vehicle.stats.totalKm.toLocaleString()
                                : '0'}{' '}
                              km
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">
                              Consumo medio
                            </p>
                            <p className="font-medium">
                              {vehicle?.stats?.fuelEfficiency || '0'} L/100km
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-lg border p-4 space-y-2">
                        <h3 className="font-medium flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-blue-500" />
                          Fechas importantes
                        </h3>
                        <div className="space-y-1 text-sm">
                          <div>
                            <p className="text-muted-foreground">
                              Último mantenimiento
                            </p>
                            <p className="font-medium">
                              {vehicle?.stats?.lastMaintenance
                                ? new Date(
                                    vehicle.stats.lastMaintenance
                                  ).toLocaleDateString()
                                : 'Sin datos'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="maintenance" className="mt-4 space-y-4">
                  {/* Health status */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">
                        Estado del Vehículo
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">
                            Salud general
                          </span>
                          <span className="text-sm font-medium">
                            {healthScore}%
                          </span>
                        </div>
                        <Progress value={healthScore} className="h-2" />

                        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-2">
                          {lastReview ? (
                            <>
                              <div className="flex items-center gap-2">
                                {lastReview.lights_working ? (
                                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                                ) : (
                                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                                )}
                                <span className="text-sm">Luces</span>
                              </div>
                              <div className="flex items-center gap-2">
                                {lastReview.brakes_working ? (
                                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                                ) : (
                                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                                )}
                                <span className="text-sm">Frenos</span>
                              </div>
                              <div className="flex items-center gap-2">
                                {lastReview.tires_condition ? (
                                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                                ) : (
                                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                                )}
                                <span className="text-sm">Neumáticos</span>
                              </div>
                              <div className="flex items-center gap-2">
                                {lastReview.fluids_checked ? (
                                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                                ) : (
                                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                                )}
                                <span className="text-sm">Fluidos</span>
                              </div>
                              <div className="flex items-center gap-2">
                                {lastReview.clean_interior ? (
                                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                                ) : (
                                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                                )}
                                <span className="text-sm">Interior</span>
                              </div>
                            </>
                          ) : (
                            <p className="text-muted-foreground col-span-2 text-sm">
                              No hay datos de revisión disponibles.
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Maintenance History */}
                  <Card>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base flex items-center gap-2">
                          <History className="h-4 w-4" />
                          Historial de Revisiones
                        </CardTitle>
                        <Badge variant="outline" className="font-mono">
                          {reviews.length}{' '}
                          {reviews.length === 1 ? 'revisión' : 'revisiones'}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {reviews.length > 0 ? (
                        <div className="space-y-4">
                          {reviews.map((review, index) => (
                            <div
                              key={review.id}
                              className="rounded-lg border p-3 space-y-2"
                            >
                              <div className="flex justify-between">
                                <div className="flex items-center gap-2">
                                  <ClipboardList className="h-4 w-4 text-blue-500" />
                                  <span className="font-medium text-sm">
                                    Revisión del{' '}
                                    {new Date(
                                      review.review_date
                                    ).toLocaleDateString()}
                                  </span>
                                </div>
                                <Badge
                                  variant={
                                    review.status === 'requires_attention'
                                      ? 'destructive'
                                      : review.status === 'completed'
                                      ? 'outline'
                                      : 'secondary'
                                  }
                                >
                                  {review.status === 'requires_attention'
                                    ? 'Requiere atención'
                                    : review.status === 'completed'
                                    ? 'Completada'
                                    : 'Pendiente'}
                                </Badge>
                              </div>

                              {review.issues_noted && (
                                <div className="bg-amber-50 text-amber-900 rounded p-2 text-sm flex items-start gap-2">
                                  <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                  <span>{review.issues_noted}</span>
                                </div>
                              )}

                              <div className="text-xs text-muted-foreground">
                                Realizada por {review.driver_name}{' '}
                                {review.driver_lastname}
                              </div>

                              {index < reviews.length - 1 && <Separator />}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="bg-muted rounded-md p-4 text-center text-muted-foreground text-sm">
                          No hay revisiones registradas para este vehículo.
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="location" className="mt-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">
                        Ubicación Actual
                      </CardTitle>
                      <CardDescription>
                        {vehicle?.status === 'assigned' ? (
                          <CardDescription>
                            El vehículo está actualmente en ruta.
                          </CardDescription>
                        ) : (
                          <CardDescription>
                            {vehicle?.status === 'maintenance'
                              ? 'El vehículo está en mantenimiento.'
                              : 'El vehículo está estacionado.'}
                          </CardDescription>
                        )}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {vehicle?.position && (
                        <div className="h-[300px] rounded-md overflow-hidden border">
                          <MapContainer
                            center={[
                              vehicle.position.lat,
                              vehicle.position.lng
                            ]}
                            zoom={13}
                            style={{ height: '100%', width: '100%' }}
                          >
                            <TileLayer
                              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            />
                            <Marker
                              position={[
                                vehicle.position.lat,
                                vehicle.position.lng
                              ]}
                            >
                              <Popup>
                                {vehicle?.brand} {vehicle?.model} <br />
                                Matrícula: {vehicle?.plate}
                              </Popup>
                            </Marker>
                          </MapContainer>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Acciones rápidas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button className="w-full justify-start" variant="outline">
                  <Wrench className="mr-2 h-4 w-4" />
                  Marcar para mantenimiento
                </Button>
                <Button
                  className="w-full justify-start"
                  variant="outline"
                  disabled={vehicle?.status !== 'available'}
                >
                  <User className="mr-2 h-4 w-4" />
                  Asignar conductor
                </Button>
                <Link to="/admin/map">
                  <Button className="w-full justify-start" variant="outline">
                    <MapPin className="mr-2 h-4 w-4" />
                    Ver en mapa general
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Vehicle Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Datos técnicos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Marca</span>
                    <span className="font-medium">{vehicle.brand}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Modelo</span>
                    <span className="font-medium">{vehicle.model}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Matrícula</span>
                    <span className="font-mono font-medium">
                      {vehicle.plate}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Estado</span>
                    <span>
                      <VehicleStatusBadge status={vehicle.status} size="sm" />
                    </span>
                  </div>

                  {/* Simulated data */}
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Año de fabricación
                    </span>
                    <span className="font-medium">2022</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Tipo de combustible
                    </span>
                    <span className="font-medium">Diesel</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Capacidad</span>
                    <span className="font-medium">3500 kg</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Vehicle Health Card */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Shield className="h-5 w-5 text-blue-500" />
                  Estado del vehículo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1 text-sm">
                      <span>Salud general</span>
                      <span className="font-medium">{healthScore}%</span>
                    </div>
                    <Progress
                      value={healthScore}
                      className="h-2.5"
                      style={
                        {
                          backgroundColor:
                            healthScore < 70 ? '#fecaca' : '#f3f4f6',
                          '--progress-color':
                            healthScore < 70
                              ? '#ef4444'
                              : healthScore < 90
                              ? '#f59e0b'
                              : '#22c55e'
                        } as React.CSSProperties
                      }
                    />
                  </div>

                  {lastReview?.issues_noted && (
                    <div className="rounded-md border-l-4 border-amber-500 bg-amber-50 p-2">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5" />
                        <div className="text-sm text-amber-700">
                          <div className="font-medium mb-0.5">
                            Problemas detectados:
                          </div>
                          <p>{lastReview.issues_noted}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {healthScore < 70 ? (
                    <Button variant="destructive" className="w-full">
                      <Wrench className="mr-2 h-4 w-4" />
                      Programar mantenimiento urgente
                    </Button>
                  ) : healthScore < 90 ? (
                    <Button
                      variant="default"
                      className="w-full bg-amber-600 hover:bg-amber-700"
                    >
                      <Wrench className="mr-2 h-4 w-4" />
                      Programar revisión
                    </Button>
                  ) : (
                    <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 rounded-md p-2">
                      <CheckCircle2 className="h-4 w-4" />
                      El vehículo está en buen estado
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}

export default VehicleDetailPage
