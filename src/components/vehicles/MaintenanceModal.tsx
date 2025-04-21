import { useState, useEffect } from 'react'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog'
import { Calendar } from '@/components/ui/calendar'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { format } from 'date-fns'
import { CalendarIcon } from 'lucide-react'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { Vehicle } from '@/types/fleet'
import { vehicleApi } from '@/services/api'

interface MaintenanceModalProps {
  isOpen: boolean
  onClose: () => void
  vehicle: Vehicle
  onSuccess: () => void
}

export function MaintenanceModal({
  isOpen,
  onClose,
  vehicle,
  onSuccess
}: MaintenanceModalProps) {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [description, setDescription] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const { token } = useAuth()

  // Debug vehicle object when component mounts or vehicle changes
  useEffect(() => {
    console.log('MaintenanceModal - Vehicle:', vehicle)
    console.log('MaintenanceModal - Vehicle ID:', vehicle?.id)
  }, [vehicle])

  const handleSubmit = async () => {
    console.log(
      'Submit maintenance - full vehicle object:',
      JSON.stringify(vehicle)
    )
    console.log('Vehicle properties:', {
      id: vehicle?.id,
      brand: vehicle?.brand,
      model: vehicle?.model,
      plate: vehicle?.plate
    })

    if (!date) {
      toast({
        title: 'Error',
        description: 'Por favor selecciona una fecha para el mantenimiento',
        variant: 'destructive'
      })
      return
    }

    if (!token) {
      toast({
        title: 'Error',
        description: 'No estás autenticado',
        variant: 'destructive'
      })
      return
    }

    // Check if vehicle ID is valid
    if (!vehicle?.id) {
      console.error('Error: Vehicle ID is undefined or null', vehicle)
      toast({
        title: 'Error',
        description: 'ID de vehículo no válido',
        variant: 'destructive'
      })
      return
    }

    setIsLoading(true)
    try {
      // Create maintenance data object
      const maintenanceData = {
        scheduled_date: date.toISOString(),
        description: description.trim() || 'Mantenimiento programado'
      }

      console.log('Sending maintenance request for vehicle ID:', vehicle.id)

      // Update vehicle status to maintenance and send maintenance data
      const response = await vehicleApi.updateVehicleStatus(
        vehicle.id,
        'maintenance',
        token,
        maintenanceData
      )

      console.log('Maintenance API response:', response)

      if (response.error) {
        throw new Error(response.error)
      }

      toast({
        title: 'Éxito',
        description: 'Vehículo marcado para mantenimiento'
      })
      onSuccess()
      onClose()
    } catch (error) {
      console.error('Error al programar mantenimiento:', error)
      toast({
        title: 'Error',
        description: 'No se pudo programar el mantenimiento',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Programar Mantenimiento</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="vehicle">Vehículo</Label>
            <Input
              id="vehicle"
              value={
                vehicle && vehicle.brand && vehicle.model && vehicle.plate
                  ? `${vehicle.brand} ${vehicle.model} - ${vehicle.plate}`
                  : 'Información no disponible'
              }
              disabled
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="date">Fecha de Mantenimiento</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !date && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, 'PPP') : <span>Seleccionar fecha</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              placeholder="Describe el mantenimiento necesario"
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? 'Programando...' : 'Programar Mantenimiento'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
