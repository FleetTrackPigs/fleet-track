import { useEffect, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../hooks/use-toast'
import { serviceApi, driverApi, vehicleApi } from '../../services/api'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '../../components/ui/table'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '../../components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '../../components/ui/select'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '../../components/ui/form'
import { Input } from '../../components/ui/input'
import { Textarea } from '../../components/ui/textarea'
import { Loader2, Plus, MapPin, Truck, User } from 'lucide-react'
import { useForm, SubmitHandler } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import ServiceDetailModal from '../../components/services/ServiceDetailModal'
import AdminLayout from '../../components/layout/AdminLayout'

// Define types for drivers and vehicles
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

// Form validation schema
const serviceFormSchema = z.object({
  name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  description: z.string().optional(),
  driver_id: z.string().optional(),
  vehicle_id: z.string().optional(),
  start_address: z.string().min(5, 'La dirección de origen es requerida'),
  end_address: z.string().min(5, 'La dirección de destino es requerida'),
  start_lat: z.coerce.number(),
  start_lng: z.coerce.number(),
  end_lat: z.coerce.number(),
  end_lng: z.coerce.number(),
  scheduled_date: z.string().optional(),
  notes: z.string().optional()
})

type ServiceFormValues = z.infer<typeof serviceFormSchema>

const Services = () => {
  const { user, token } = useAuth()
  const { toast } = useToast()
  const [services, setServices] = useState<Service[]>([])
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)

  const form = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceFormSchema),
    defaultValues: {
      name: '',
      description: '',
      start_address: '',
      end_address: '',
      start_lat: 40.416775, // Default to Madrid's coordinates
      start_lng: -3.70379,
      end_lat: 41.385064, // Default to Barcelona's coordinates
      end_lng: 2.173404,
      notes: ''
    }
  })

  useEffect(() => {
    const fetchData = async () => {
      if (!token) return

      try {
        setLoading(true)
        console.log('Fetching services, drivers, and vehicles data')

        // Fetch services
        const servicesResponse = await serviceApi.getAllServices(token)
        if (servicesResponse.error) {
          throw new Error(`Error fetching services: ${servicesResponse.error}`)
        }

        const servicesData = Array.isArray(servicesResponse.data)
          ? servicesResponse.data
          : servicesResponse.data?.data || []
        console.log('Processed services data:', servicesData)
        setServices(servicesData as Service[])

        // Fetch drivers
        const driversResponse = await driverApi.getAllDrivers(token)
        if (driversResponse.error) {
          throw new Error(`Error fetching drivers: ${driversResponse.error}`)
        }

        const driversData = (driversResponse.data?.data as Driver[]) || []
        console.log('Drivers data:', driversData)
        setDrivers(driversData)

        // Fetch vehicles
        const vehiclesResponse = await vehicleApi.getAllVehicles(token)
        if (vehiclesResponse.error) {
          throw new Error(`Error fetching vehicles: ${vehiclesResponse.error}`)
        }

        const vehiclesData = (vehiclesResponse.data?.data as Vehicle[]) || []
        console.log('Vehicles data:', vehiclesData)
        setVehicles(vehiclesData)
      } catch (error) {
        console.error('Error fetching data:', error)
        toast({
          title: 'Error',
          description: 'Ha ocurrido un error al cargar los datos',
          variant: 'destructive'
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [token, toast])

  const onSubmit: SubmitHandler<ServiceFormValues> = async data => {
    if (!token) return

    try {
      const response = await serviceApi.createService(data, token)
      if (response.error) {
        throw new Error(response.error)
      }

      // Add the new service to the list
      const newService = response.data?.data as Service
      if (newService) {
        setServices(prevServices => [...prevServices, newService])

        // Close the dialog and reset form
        setIsAddDialogOpen(false)
        form.reset()

        toast({
          title: 'Servicio creado',
          description: 'El servicio ha sido creado exitosamente'
        })
      } else {
        throw new Error('No se recibieron datos del servicio creado')
      }
    } catch (error) {
      console.error('Error creating service:', error)
      toast({
        title: 'Error',
        description: 'Ha ocurrido un error al crear el servicio',
        variant: 'destructive'
      })
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

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'No programado'
    try {
      return format(new Date(dateString), 'dd/MM/yyyy HH:mm', { locale: es })
    } catch (error) {
      return 'Fecha inválida'
    }
  }

  const handleServiceClick = (service: Service) => {
    setSelectedService(service)
    setIsDetailModalOpen(true)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <AdminLayout>
      <div className="container p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Servicios de transporte</h1>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" /> Añadir Servicio
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Añadir nuevo servicio</DialogTitle>
                <DialogDescription>
                  Complete los datos del servicio de transporte
                </DialogDescription>
              </DialogHeader>

              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nombre del servicio*</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Entrega de mercancía"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="scheduled_date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Fecha programada</FormLabel>
                          <FormControl>
                            <Input type="datetime-local" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descripción</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Detalles del servicio..."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="driver_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Conductor</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccionar conductor" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {drivers.map(driver => (
                                <SelectItem
                                  key={driver.id}
                                  value={driver.id}
                                  disabled={driver.status !== 'active'}
                                >
                                  {driver.name} {driver.lastname}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="vehicle_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Vehículo</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccionar vehículo" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {vehicles.map(vehicle => (
                                <SelectItem
                                  key={vehicle.id}
                                  value={vehicle.id}
                                  disabled={vehicle.status !== 'available'}
                                >
                                  {vehicle.brand} {vehicle.model} (
                                  {vehicle.plate})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <FormField
                        control={form.control}
                        name="start_address"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Dirección de origen*</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Calle Industria 123, Madrid"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        <FormField
                          control={form.control}
                          name="start_lat"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Latitud*</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  step="0.0000001"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="start_lng"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Longitud*</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  step="0.0000001"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    <div>
                      <FormField
                        control={form.control}
                        name="end_address"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Dirección de destino*</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Avenida Comercial 456, Barcelona"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        <FormField
                          control={form.control}
                          name="end_lat"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Latitud*</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  step="0.0000001"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="end_lng"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Longitud*</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  step="0.0000001"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </div>

                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notas adicionales</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Instrucciones especiales, detalles de contacto, etc."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end space-x-2 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsAddDialogOpen(false)}
                    >
                      Cancelar
                    </Button>
                    <Button type="submit">Crear servicio</Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {services.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-muted-foreground mb-4">
              No hay servicios registrados
            </p>
            <Button onClick={() => setIsAddDialogOpen(true)} variant="outline">
              <Plus className="mr-2 h-4 w-4" /> Crear el primer servicio
            </Button>
          </div>
        ) : (
          <Table>
            <TableCaption>Listado de servicios de transporte</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Origen → Destino</TableHead>
                <TableHead>Conductor</TableHead>
                <TableHead>Vehículo</TableHead>
                <TableHead>Fecha programada</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acción</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {services.map(service => (
                <TableRow
                  key={service.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleServiceClick(service)}
                >
                  <TableCell className="font-medium">{service.name}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="flex items-center">
                        <MapPin className="h-3 w-3 mr-1 text-green-600" />
                        {service.start_address}
                      </span>
                      <span className="flex items-center mt-1">
                        <MapPin className="h-3 w-3 mr-1 text-red-600" />
                        {service.end_address}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {service.driver ? (
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-1" />
                        {service.driver.name} {service.driver.lastname}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">Sin asignar</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {service.vehicle ? (
                      <div className="flex items-center">
                        <Truck className="h-4 w-4 mr-1" />
                        {service.vehicle.brand} {service.vehicle.model}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">Sin asignar</span>
                    )}
                  </TableCell>
                  <TableCell>{formatDate(service.scheduled_date)}</TableCell>
                  <TableCell>{getStatusBadge(service.status)}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={e => {
                        e.stopPropagation()
                        handleServiceClick(service)
                      }}
                    >
                      Ver detalles
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {/* Service Detail Modal */}
        {selectedService && (
          <ServiceDetailModal
            service={selectedService}
            isOpen={isDetailModalOpen}
            setIsOpen={setIsDetailModalOpen}
            drivers={drivers}
            vehicles={vehicles}
            onServiceUpdated={updatedService => {
              // Update the service in the list
              setServices(
                services.map(s =>
                  s.id === updatedService.id ? updatedService : s
                )
              )
              setSelectedService(updatedService)
            }}
            onServiceDeleted={serviceId => {
              // Remove the service from the list
              setServices(services.filter(s => s.id !== serviceId))
              setIsDetailModalOpen(false)
            }}
          />
        )}
      </div>
    </AdminLayout>
  )
}

export default Services
