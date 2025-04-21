import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Vehicle, Driver } from '@/types/fleet'
import { useFleet } from '@/contexts/FleetContext'
import { Loader2 } from 'lucide-react'
import { useEffect } from 'react'

// Zod schema for validation
const vehicleSchema = z.object({
  brand: z.string().min(1, { message: 'Marca es obligatoria' }),
  model: z.string().min(1, { message: 'Modelo es obligatorio' }),
  plate: z.string().min(1, { message: 'Matrícula es obligatoria' }),
  driverId: z.string().optional().nullable()
})

type VehicleFormValues = z.infer<typeof vehicleSchema>

interface VehicleFormProps {
  vehicle?: Vehicle // Optional vehicle for editing
  onSave: () => void // Callback after successful save
}

export function VehicleForm({ vehicle, onSave }: VehicleFormProps) {
  const {
    createVehicle,
    updateVehicle,
    drivers,
    getAvailableDrivers,
    isLoading
  } = useFleet()

  console.log('Form data - Vehicle:', vehicle)
  console.log('Form data - All drivers:', drivers)

  const availableDrivers = getAvailableDrivers()
  // If editing a vehicle, include its current driver in the list if any
  const currentDriver = vehicle?.driver?.id
    ? drivers.find(d => d.id === vehicle.driver?.id)
    : undefined

  const allDriverOptions = currentDriver
    ? [...availableDrivers, currentDriver]
    : availableDrivers

  console.log('Form data - Available drivers:', availableDrivers)
  console.log('Form data - Current driver:', currentDriver)

  const defaultValues: Partial<VehicleFormValues> = {
    brand: vehicle?.brand || '',
    model: vehicle?.model || '',
    plate: vehicle?.plate || '',
    driverId: vehicle?.driver?.id || null
  }

  const form = useForm<VehicleFormValues>({
    resolver: zodResolver(vehicleSchema),
    defaultValues,
    mode: 'onChange'
  })

  // Reset form if vehicle prop changes (e.g., opening modal for different vehicle)
  useEffect(() => {
    if (vehicle) {
      console.log('Setting form values from vehicle:', vehicle)
      form.reset({
        brand: vehicle.brand || '',
        model: vehicle.model || '',
        plate: vehicle.plate || '',
        driverId: vehicle.driver?.id || null
      })
    }
  }, [form, vehicle])

  const onSubmit = async (data: VehicleFormValues) => {
    console.log('Form submit data:', data)
    try {
      const payload = {
        brand: data.brand,
        model: data.model,
        plate: data.plate,
        // Explicitly pass driverId, ensuring null is sent if 'none' is selected
        driverId: data.driverId === 'none' ? null : data.driverId
      }

      if (vehicle) {
        // Update existing vehicle
        await updateVehicle(vehicle.id, payload)
      } else {
        // Create new vehicle
        await createVehicle(payload)
      }
      onSave() // Close modal on success
    } catch (error) {
      // Error is handled and toasted in the context
      console.error('Form submission error:', error)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="brand"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Marca</FormLabel>
                <FormControl>
                  <Input placeholder="Ej: Ford" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="model"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Modelo</FormLabel>
                <FormControl>
                  <Input placeholder="Ej: Transit" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="plate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Matrícula</FormLabel>
              <FormControl>
                <Input placeholder="Ej: ABC1234" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="driverId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Asignar Conductor</FormLabel>
              <Select
                onValueChange={value =>
                  field.onChange(value === 'none' ? null : value)
                }
                defaultValue={field.value || 'none'} // Use 'none' for null/undefined
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar conductor..." />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="none">
                    <span className="text-muted-foreground">
                      -- No asignar --
                    </span>
                  </SelectItem>
                  {allDriverOptions.map(driver => (
                    <SelectItem key={driver.id} value={driver.id}>
                      {driver.name} {driver.lastname}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                Selecciona un conductor activo y disponible para asignarlo a
                este vehículo.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          {vehicle ? 'Guardar Cambios' : 'Crear Vehículo'}
        </Button>
      </form>
    </Form>
  )
}
