import { useState } from 'react'
import { useToast } from '@/hooks/use-toast'
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

  const handleSubmit = async () => {
    if (!date) {
      toast({
        title: 'Error',
        description: 'Please select a maintenance date',
        variant: 'destructive'
      })
      return
    }

    setIsLoading(true)
    try {
      // First update the vehicle status to maintenance
      await vehicleApi.updateVehicleStatus(vehicle.id, 'maintenance')

      // Here you would also save the maintenance schedule to the database
      // This would be implemented in a future update

      toast({
        title: 'Success',
        description: 'Vehicle marked for maintenance'
      })
      onSuccess()
      onClose()
    } catch (error) {
      console.error('Error scheduling maintenance:', error)
      toast({
        title: 'Error',
        description: 'Failed to schedule maintenance',
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
          <DialogTitle>Schedule Maintenance</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="vehicle">Vehicle</Label>
            <Input
              id="vehicle"
              value={`${vehicle.brand} ${vehicle.model} - ${vehicle.license_plate}`}
              disabled
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="date">Maintenance Date</Label>
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
                  {date ? format(date, 'PPP') : <span>Pick a date</span>}
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
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe the maintenance needed"
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? 'Scheduling...' : 'Schedule Maintenance'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
