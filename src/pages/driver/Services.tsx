import { useEffect, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../hooks/use-toast'
import { serviceApi } from '../../services/api'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '../../components/ui/card'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '../../components/ui/tabs'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import ServiceDetailModal from '../../components/services/ServiceDetailModal'
import { Loader2, MapPin, Calendar, Clock } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import DriverLayout from '../../components/layout/DriverLayout'
import { useFleet } from '../../contexts/FleetContext'

// Service type definition
type Service = {
  id: string
  name: string
  description: string | null
  driver_id: string | null
  vehicle_id: string | null
  driver?: Driver | null
  vehicle?: Vehicle | null
  start_address: string
  end_address: string
  start_lat: number
  start_lng: number
  end_lat: number
  end_lng: number
  scheduled_date: string | null
  start_time: string | null
  end_time: string | null
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled'
  notes: string | null
  created_at: string
  updated_at: string
}

// Driver and Vehicle types to fix any references
type Driver = {
  id: string
  name: string
  lastname: string
  status: string
}

type Vehicle = {
  id: string
  brand: string
  model: string
  plate: string
  status: string
}

const DriverServices = () => {
  const { user, token } = useAuth()
  const { drivers } = useFleet()
  const { toast } = useToast()
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('pending')
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [driverId, setDriverId] = useState<string | null>(null)

  // Find the driver ID associated with the current user
  useEffect(() => {
    if (user && drivers.length > 0) {
      // Find the driver by matching user ID
      const currentDriver = drivers.find(
        d => d.userid === user.id || d.user?.id === user.id
      )

      if (currentDriver) {
        setDriverId(currentDriver.id)
        console.log('Found driver ID:', currentDriver.id)
      } else {
        console.log('No driver found for user ID:', user.id)
      }
    }
  }, [user, drivers])

  useEffect(() => {
    const fetchServices = async () => {
      if (!token || !driverId) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        console.log('Fetching services for driver ID:', driverId)
        const response = await serviceApi.getDriverServices(driverId, token)

        if (response.error) {
          throw new Error(response.error)
        }

        const servicesData = Array.isArray(response.data)
          ? response.data
          : response.data?.data || []
        console.log('Processed services data:', servicesData)
        setServices(servicesData as Service[])
      } catch (error) {
        console.error('Error fetching services:', error)
        toast({
          title: 'Error',
          description: 'No se pudieron cargar los servicios',
          variant: 'destructive'
        })
        setServices([])
      } finally {
        setLoading(false)
      }
    }

    fetchServices()
  }, [token, driverId, toast])

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'No programado'
    try {
      return format(new Date(dateString), 'dd/MM/yyyy HH:mm', { locale: es })
    } catch (error) {
      return 'Fecha inválida'
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline">Pendiente</Badge>
      case 'in-progress':
        return <Badge variant="secondary">En Progreso</Badge>
      case 'completed':
        return <Badge variant="default">Completado</Badge>
      case 'cancelled':
        return <Badge variant="destructive">Cancelado</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const handleStatusChange = async (serviceId: string, newStatus: string) => {
    if (!token) return

    try {
      const response = await serviceApi.updateServiceStatus(
        serviceId,
        newStatus as 'pending' | 'in-progress' | 'completed' | 'cancelled',
        token
      )
      if (response.error) {
        throw new Error(response.error)
      }

      // Update the list
      setServices(
        services.map(service =>
          service.id === serviceId
            ? {
                ...service,
                status: newStatus as
                  | 'pending'
                  | 'in-progress'
                  | 'completed'
                  | 'cancelled'
              }
            : service
        )
      )

      toast({
        title: 'Estado actualizado',
        description: `El servicio ha sido ${
          newStatus === 'in-progress'
            ? 'iniciado'
            : newStatus === 'completed'
            ? 'completado'
            : 'actualizado'
        }`
      })
    } catch (error) {
      console.error('Error updating service status:', error)
      toast({
        title: 'Error',
        description: 'No se pudo actualizar el estado del servicio',
        variant: 'destructive'
      })
    }
  }

  const handleServiceClick = (service: Service) => {
    setSelectedService(service)
    setIsDetailModalOpen(true)
  }

  // Filter services based on active tab
  const filteredServices = services.filter(service => {
    if (activeTab === 'pending') return service.status === 'pending'
    if (activeTab === 'in-progress') return service.status === 'in-progress'
    if (activeTab === 'completed') return service.status === 'completed'
    return true // all tab
  })

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <DriverLayout>
      <div className="container py-6">
        <h1 className="text-2xl font-bold mb-6">Mis Servicios</h1>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 mb-6">
            <TabsTrigger value="pending">Pendientes</TabsTrigger>
            <TabsTrigger value="in-progress">En Progreso</TabsTrigger>
            <TabsTrigger value="completed">Completados</TabsTrigger>
            <TabsTrigger value="all">Todos</TabsTrigger>
          </TabsList>

          {['pending', 'in-progress', 'completed', 'all'].map(tab => (
            <TabsContent key={tab} value={tab}>
              {filteredServices.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground mb-2">
                    No hay servicios{' '}
                    {tab === 'all'
                      ? ''
                      : tab === 'pending'
                      ? 'pendientes'
                      : tab === 'in-progress'
                      ? 'en progreso'
                      : 'completados'}
                  </p>
                  {tab === 'all' && (
                    <p className="text-sm text-muted-foreground">
                      Aún no tienes servicios asignados
                    </p>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredServices.map(service => (
                    <Card
                      key={service.id}
                      className="cursor-pointer hover:shadow-md transition-shadow"
                    >
                      <CardHeader
                        className="pb-2"
                        onClick={() => handleServiceClick(service)}
                      >
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-lg">
                            {service.name}
                          </CardTitle>
                          {getStatusBadge(service.status)}
                        </div>
                        <CardDescription>
                          {service.description || 'Sin descripción'}
                        </CardDescription>
                      </CardHeader>
                      <CardContent onClick={() => handleServiceClick(service)}>
                        <div className="space-y-2">
                          <div className="flex items-start gap-2">
                            <MapPin className="h-4 w-4 text-green-500 mt-1" />
                            <div>
                              <p className="text-sm font-medium">Origen:</p>
                              <p className="text-sm text-muted-foreground">
                                {service.start_address}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-start gap-2">
                            <MapPin className="h-4 w-4 text-red-500 mt-1" />
                            <div>
                              <p className="text-sm font-medium">Destino:</p>
                              <p className="text-sm text-muted-foreground">
                                {service.end_address}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-primary" />
                            <div>
                              <p className="text-sm font-medium">Programado:</p>
                              <p className="text-sm text-muted-foreground">
                                {formatDate(service.scheduled_date)}
                              </p>
                            </div>
                          </div>
                          {service.vehicle && (
                            <div className="border-t pt-2 mt-2">
                              <p className="text-sm">
                                <span className="font-medium">Vehículo: </span>
                                {service.vehicle.brand} {service.vehicle.model}{' '}
                                ({service.vehicle.plate})
                              </p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                      <CardFooter className="border-t pt-4 flex justify-between">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleServiceClick(service)}
                        >
                          Ver detalles
                        </Button>

                        {service.status === 'pending' && (
                          <Button
                            size="sm"
                            onClick={() =>
                              handleStatusChange(service.id, 'in-progress')
                            }
                          >
                            <Clock className="mr-2 h-4 w-4" /> Iniciar Servicio
                          </Button>
                        )}

                        {service.status === 'in-progress' && (
                          <Button
                            size="sm"
                            onClick={() =>
                              handleStatusChange(service.id, 'completed')
                            }
                          >
                            Completar Servicio
                          </Button>
                        )}
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>

        {/* Service Detail Modal */}
        {selectedService && (
          <ServiceDetailModal
            service={selectedService}
            isOpen={isDetailModalOpen}
            setIsOpen={setIsDetailModalOpen}
            drivers={[]}
            vehicles={[]}
            onServiceUpdated={updatedService => {
              // Update the service in the list
              setServices(
                services.map(s =>
                  s.id === updatedService.id ? updatedService : s
                )
              )
              setSelectedService(updatedService)
            }}
            onServiceDeleted={() => {}} // Drivers can't delete services
          />
        )}
      </div>
    </DriverLayout>
  )
}

export default DriverServices
