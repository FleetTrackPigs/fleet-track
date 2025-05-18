import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../hooks/use-toast'
import { serviceApi } from '../../services/api'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '../ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '../ui/select'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '../ui/form'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '../ui/alert-dialog'
import { Loader2, MapPin, Clock, Truck, User } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import ServiceMapView from './ServiceMapView'

// Types
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
  driver_id: z.string().optional().nullable(),
  vehicle_id: z.string().optional().nullable(),
  start_address: z.string().min(5, 'La dirección de origen es requerida'),
  end_address: z.string().min(5, 'La dirección de destino es requerida'),
  start_lat: z.coerce.number(),
  start_lng: z.coerce.number(),
  end_lat: z.coerce.number(),
  end_lng: z.coerce.number(),
  scheduled_date: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  status: z.enum(['pending', 'in-progress', 'completed', 'cancelled'])
})

type ServiceFormValues = z.infer<typeof serviceFormSchema>

interface ServiceDetailModalProps {
  service: Service
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
  drivers: Driver[]
  vehicles: Vehicle[]
  onServiceUpdated: (updatedService: Service) => void
  onServiceDeleted: (serviceId: string) => void
}

const ServiceDetailModal = ({
  service,
  isOpen,
  setIsOpen,
  drivers,
  vehicles,
  onServiceUpdated,
  onServiceDeleted
}: ServiceDetailModalProps) => {
  const { token } = useAuth()
  const { toast } = useToast()
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('details')

  const form = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceFormSchema),
    defaultValues: {
      name: service.name,
      description: service.description || '',
      driver_id: service.driver_id,
      vehicle_id: service.vehicle_id,
      start_address: service.start_address,
      end_address: service.end_address,
      start_lat: service.start_lat,
      start_lng: service.start_lng,
      end_lat: service.end_lat,
      end_lng: service.end_lng,
      scheduled_date: service.scheduled_date,
      notes: service.notes,
      status: service.status
    }
  })

  const onSubmit = async (data: ServiceFormValues) => {
    if (!token) return

    try {
      setIsLoading(true)
      const response = await serviceApi.updateService(service.id, data, token)
      if (response.error) {
        throw new Error(response.error)
      }

      const updatedService = response.data?.data
      if (updatedService) {
        onServiceUpdated(updatedService as Service)
        setIsEditing(false)
        toast({
          title: 'Servicio actualizado',
          description: 'Los cambios han sido guardados exitosamente.'
        })
      }
    } catch (error) {
      console.error('Error updating service:', error)
      toast({
        title: 'Error',
        description: 'No se pudo actualizar el servicio',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleStatusChange = async (newStatus: string) => {
    if (!token) return

    try {
      setIsLoading(true)
      const response = await serviceApi.updateServiceStatus(
        service.id,
        newStatus as 'pending' | 'in-progress' | 'completed' | 'cancelled',
        token
      )
      if (response.error) {
        throw new Error(response.error)
      }

      const updatedService = response.data?.data
      if (updatedService) {
        onServiceUpdated(updatedService as Service)
        toast({
          title: 'Estado actualizado',
          description: `El servicio ahora está ${getStatusText(newStatus)}`
        })
      }
    } catch (error) {
      console.error('Error updating service status:', error)
      toast({
        title: 'Error',
        description: 'No se pudo actualizar el estado del servicio',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteService = async () => {
    if (!token) return

    try {
      setIsLoading(true)
      const response = await serviceApi.deleteService(service.id, token)
      if (response.error) {
        throw new Error(response.error)
      }

      onServiceDeleted(service.id)
      toast({
        title: 'Servicio eliminado',
        description: 'El servicio ha sido eliminado exitosamente'
      })
    } catch (error) {
      console.error('Error deleting service:', error)
      toast({
        title: 'Error',
        description: 'No se pudo eliminar el servicio',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'No especificado'
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

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'pendiente'
      case 'in-progress':
        return 'en progreso'
      case 'completed':
        return 'completado'
      case 'cancelled':
        return 'cancelado'
      default:
        return status
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar servicio' : 'Detalles del servicio'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Modifique los detalles del servicio'
              : service.description || 'Información del servicio de transporte'}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="details">Detalles</TabsTrigger>
            <TabsTrigger value="map">Mapa</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4 mt-4">
            {isEditing ? (
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
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Estado*</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccionar estado" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="pending">Pendiente</SelectItem>
                              <SelectItem value="in-progress">
                                En Progreso
                              </SelectItem>
                              <SelectItem value="completed">
                                Completado
                              </SelectItem>
                              <SelectItem value="cancelled">
                                Cancelado
                              </SelectItem>
                            </SelectContent>
                          </Select>
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
                          <Textarea {...field} value={field.value || ''} />
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
                            defaultValue={field.value || undefined}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccionar conductor" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="">Sin conductor</SelectItem>
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
                            defaultValue={field.value || undefined}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccionar vehículo" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="">Sin vehículo</SelectItem>
                              {vehicles.map(vehicle => (
                                <SelectItem
                                  key={vehicle.id}
                                  value={vehicle.id}
                                  disabled={
                                    vehicle.status !== 'available' &&
                                    vehicle.id !== service.vehicle_id
                                  }
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

                  <FormField
                    control={form.control}
                    name="scheduled_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fecha programada</FormLabel>
                        <FormControl>
                          <Input
                            type="datetime-local"
                            {...field}
                            value={field.value || ''}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <FormField
                        control={form.control}
                        name="start_address"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Dirección de origen*</FormLabel>
                            <FormControl>
                              <Input {...field} />
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
                              <Input {...field} />
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
                          <Textarea {...field} value={field.value || ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end space-x-2 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsEditing(false)}
                      disabled={isLoading}
                    >
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={isLoading}>
                      {isLoading && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Guardar cambios
                    </Button>
                  </div>
                </form>
              </Form>
            ) : (
              <>
                <div className="flex justify-between">
                  <h3 className="text-xl font-semibold">{service.name}</h3>
                  <div>{getStatusBadge(service.status)}</div>
                </div>

                {service.description && (
                  <div className="my-2">
                    <p className="text-muted-foreground">
                      {service.description}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 my-4">
                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium mb-2 flex items-center">
                      <MapPin className="mr-2 h-4 w-4 text-green-600" />
                      Origen
                    </h4>
                    <p className="mb-1">{service.start_address}</p>
                    <p className="text-xs text-muted-foreground">
                      Lat: {service.start_lat}, Lng: {service.start_lng}
                    </p>
                  </div>

                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium mb-2 flex items-center">
                      <MapPin className="mr-2 h-4 w-4 text-red-600" />
                      Destino
                    </h4>
                    <p className="mb-1">{service.end_address}</p>
                    <p className="text-xs text-muted-foreground">
                      Lat: {service.end_lat}, Lng: {service.end_lng}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 my-4">
                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium mb-2 flex items-center">
                      <User className="mr-2 h-4 w-4" />
                      Conductor
                    </h4>
                    {service.driver ? (
                      <p>
                        {service.driver.name} {service.driver.lastname}
                      </p>
                    ) : (
                      <p className="text-muted-foreground">Sin asignar</p>
                    )}
                  </div>

                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium mb-2 flex items-center">
                      <Truck className="mr-2 h-4 w-4" />
                      Vehículo
                    </h4>
                    {service.vehicle ? (
                      <p>
                        {service.vehicle.brand} {service.vehicle.model} (
                        {service.vehicle.plate})
                      </p>
                    ) : (
                      <p className="text-muted-foreground">Sin asignar</p>
                    )}
                  </div>
                </div>

                <div className="border rounded-lg p-4 my-4">
                  <h4 className="font-medium mb-2 flex items-center">
                    <Clock className="mr-2 h-4 w-4" />
                    Tiempos
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Programado:
                      </p>
                      <p>{formatDate(service.scheduled_date)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Inicio:</p>
                      <p>{formatDate(service.start_time)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Fin:</p>
                      <p>{formatDate(service.end_time)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Creado:</p>
                      <p>{formatDate(service.created_at)}</p>
                    </div>
                  </div>
                </div>

                {service.notes && (
                  <div className="border rounded-lg p-4 my-4">
                    <h4 className="font-medium mb-2">Notas</h4>
                    <p>{service.notes}</p>
                  </div>
                )}

                <div className="mt-6">
                  <h4 className="font-medium mb-2">Cambiar estado</h4>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant={
                        service.status === 'pending' ? 'default' : 'outline'
                      }
                      onClick={() => handleStatusChange('pending')}
                      disabled={service.status === 'pending' || isLoading}
                    >
                      Pendiente
                    </Button>
                    <Button
                      size="sm"
                      variant={
                        service.status === 'in-progress' ? 'default' : 'outline'
                      }
                      onClick={() => handleStatusChange('in-progress')}
                      disabled={service.status === 'in-progress' || isLoading}
                    >
                      En Progreso
                    </Button>
                    <Button
                      size="sm"
                      variant={
                        service.status === 'completed' ? 'default' : 'outline'
                      }
                      onClick={() => handleStatusChange('completed')}
                      disabled={service.status === 'completed' || isLoading}
                    >
                      Completado
                    </Button>
                    <Button
                      size="sm"
                      variant={
                        service.status === 'cancelled' ? 'default' : 'outline'
                      }
                      onClick={() => handleStatusChange('cancelled')}
                      disabled={service.status === 'cancelled' || isLoading}
                    >
                      Cancelado
                    </Button>
                  </div>
                </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="map">
            <div className="h-[50vh] rounded-md overflow-hidden border">
              <ServiceMapView
                startLat={service.start_lat}
                startLng={service.start_lng}
                endLat={service.end_lat}
                endLng={service.end_lng}
                startLabel={service.start_address}
                endLabel={service.end_address}
              />
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          {!isEditing && (
            <div className="flex justify-between w-full">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" disabled={isLoading}>
                    Eliminar
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      ¿Está seguro de eliminar este servicio?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta acción no se puede deshacer. Esto eliminará
                      permanentemente el servicio de transporte.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteService}>
                      Continuar
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              <Button
                variant="outline"
                onClick={() => setIsEditing(true)}
                disabled={isLoading}
              >
                Editar
              </Button>
            </div>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default ServiceDetailModal
