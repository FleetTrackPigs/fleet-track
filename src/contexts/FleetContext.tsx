import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect
} from 'react'
import { Vehicle, Driver } from '@/types/fleet'
import { useToast } from '@/components/ui/use-toast'
import { driverApi } from '@/services/api'
import { useAuth } from './AuthContext'

// Data for vehicles
const INITIAL_VEHICLES: Vehicle[] = [
  {
    id: '1',
    brand: 'Ford',
    model: 'Transit',
    plate: 'ABC1234',
    status: 'available'
  },
  {
    id: '2',
    brand: 'Mercedes',
    model: 'Sprinter',
    plate: 'XYZ5678',
    status: 'available'
  },
  {
    id: '3',
    brand: 'Iveco',
    model: 'Daily',
    plate: 'DEF9012',
    status: 'available'
  }
]

interface FleetContextType {
  vehicles: Vehicle[]
  drivers: Driver[]
  isLoading: boolean
  addVehicle: (vehicle: Omit<Vehicle, 'id'>) => void
  updateVehicle: (id: string, vehicle: Partial<Vehicle>) => void
  deleteVehicle: (id: string) => void
  addDriver: (driver: Omit<Driver, 'id'>) => Promise<void>
  updateDriver: (id: string, driver: Partial<Driver>) => Promise<void>
  deleteDriver: (id: string) => Promise<void>
  assignVehicle: (driverId: string, vehicleId: string) => void
  unassignVehicle: (driverId: string) => void
  getDriverVehicle: (driverId: string) => Vehicle | undefined
  getVehicleDriver: (vehicleId: string) => Driver | undefined
  getAvailableVehicles: () => Vehicle[]
  getActiveDrivers: () => Driver[]
  refreshDrivers: () => Promise<void>
}

const FleetContext = createContext<FleetContextType | undefined>(undefined)

export function FleetProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast()
  const { token } = useAuth()
  const [isLoading, setIsLoading] = useState(false)

  // Vehicle state still uses local storage for now
  const [vehicles, setVehicles] = useState<Vehicle[]>(() => {
    const stored = localStorage.getItem('flotaVehicles')
    return stored ? JSON.parse(stored) : INITIAL_VEHICLES
  })

  // Drivers state now uses API
  const [drivers, setDrivers] = useState<Driver[]>([])

  // Initialize with data from API
  useEffect(() => {
    if (token) {
      refreshDrivers()
    }
  }, [token]) // Don't include refreshDrivers here

  // Keep vehicles in local storage for now
  useEffect(() => {
    localStorage.setItem('flotaVehicles', JSON.stringify(vehicles))
  }, [vehicles])

  // Function to refresh drivers from API
  const refreshDrivers = async () => {
    if (!token) return

    setIsLoading(true)
    try {
      const response = await driverApi.getAllDrivers(token)
      if (response.data?.data) {
        // Convert to Driver[] explicitly to satisfy TypeScript
        setDrivers(response.data.data as Driver[])
      }
    } catch (error) {
      console.error('Error fetching drivers:', error)
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los conductores',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Vehicle functions (unchanged)
  const addVehicle = (vehicle: Omit<Vehicle, 'id'>) => {
    const newVehicle = { ...vehicle, id: crypto.randomUUID() }
    setVehicles([...vehicles, newVehicle])
    toast({
      title: 'Vehículo añadido',
      description: `${vehicle.brand} ${vehicle.model} (${vehicle.plate}) ha sido añadido correctamente.`
    })
  }

  const updateVehicle = (id: string, updatedVehicle: Partial<Vehicle>) => {
    setVehicles(
      vehicles.map(vehicle =>
        vehicle.id === id ? { ...vehicle, ...updatedVehicle } : vehicle
      )
    )
    toast({
      title: 'Vehículo actualizado',
      description: 'Los datos del vehículo han sido actualizados.'
    })
  }

  const deleteVehicle = (id: string) => {
    // Verificar si el vehículo está asignado
    const vehicleToDelete = vehicles.find(v => v.id === id)
    if (vehicleToDelete?.status === 'assigned') {
      // Desasignar el vehículo del conductor
      const driverWithVehicle = drivers.find(d => d.vehicleId === id)
      if (driverWithVehicle) {
        updateDriver(driverWithVehicle.id, { vehicleId: undefined })
      }
    }

    setVehicles(vehicles.filter(vehicle => vehicle.id !== id))
    toast({
      title: 'Vehículo eliminado',
      description: 'El vehículo ha sido eliminado correctamente.'
    })
  }

  // Driver functions (now use API)
  const addDriver = async (driver: Omit<Driver, 'id'>) => {
    if (!token) {
      toast({
        title: 'Error',
        description: 'No hay sesión activa',
        variant: 'destructive'
      })
      return
    }

    setIsLoading(true)
    try {
      const response = await driverApi.createDriver(driver, token)
      if (response.data?.data) {
        // Instead of manually updating the state, refresh drivers from the API
        await refreshDrivers()
        toast({
          title: 'Conductor añadido',
          description: `${driver.name} ${driver.lastName} ha sido añadido correctamente.`
        })
      } else if (response.error) {
        throw new Error(response.error)
      }
    } catch (error: any) {
      console.error('Error adding driver:', error)
      toast({
        title: 'Error',
        description: error.message || 'No se pudo añadir el conductor',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const updateDriver = async (id: string, updatedDriver: Partial<Driver>) => {
    if (!token) {
      toast({
        title: 'Error',
        description: 'No hay sesión activa',
        variant: 'destructive'
      })
      return
    }

    setIsLoading(true)
    try {
      const response = await driverApi.updateDriver(id, updatedDriver, token)
      if (response.data?.data) {
        // Instead of manually updating the state, refresh drivers from the API
        await refreshDrivers()
        toast({
          title: 'Conductor actualizado',
          description: 'Los datos del conductor han sido actualizados.'
        })
      } else if (response.error) {
        throw new Error(response.error)
      }
    } catch (error: any) {
      console.error('Error updating driver:', error)
      toast({
        title: 'Error',
        description: error.message || 'No se pudo actualizar el conductor',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const deleteDriver = async (id: string) => {
    if (!token) {
      toast({
        title: 'Error',
        description: 'No hay sesión activa',
        variant: 'destructive'
      })
      return
    }

    setIsLoading(true)
    try {
      // Verificar si el conductor tiene un vehículo asignado
      const driverToDelete = drivers.find(d => d.id === id)
      if (driverToDelete?.vehicleId) {
        // Liberar el vehículo asignado
        setVehicles(
          vehicles.map(vehicle =>
            vehicle.id === driverToDelete.vehicleId
              ? { ...vehicle, status: 'available', driverId: undefined }
              : vehicle
          )
        )
      }

      const response = await driverApi.deleteDriver(id, token)
      if (response.data !== undefined) {
        // Instead of manually updating the state, refresh drivers from the API
        await refreshDrivers()
        toast({
          title: 'Conductor eliminado',
          description: 'El conductor ha sido eliminado correctamente.'
        })
      } else if (response.error) {
        throw new Error(response.error)
      }
    } catch (error: any) {
      console.error('Error deleting driver:', error)
      toast({
        title: 'Error',
        description: error.message || 'No se pudo eliminar el conductor',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const assignVehicle = (driverId: string, vehicleId: string) => {
    // Verificar si el conductor ya tiene un vehículo asignado
    const driver = drivers.find(d => d.id === driverId)
    if (driver?.vehicleId) {
      // Liberar el vehículo anterior
      setVehicles(
        vehicles.map(vehicle =>
          vehicle.id === driver.vehicleId
            ? { ...vehicle, status: 'available', driverId: undefined }
            : vehicle
        )
      )
    }

    // Asignar el nuevo vehículo al conductor
    updateDriver(driverId, { vehicleId })

    // Actualizar el estado del vehículo
    setVehicles(
      vehicles.map(vehicle =>
        vehicle.id === vehicleId
          ? { ...vehicle, status: 'assigned', driverId }
          : vehicle
      )
    )
  }

  const unassignVehicle = (driverId: string) => {
    const driver = drivers.find(d => d.id === driverId)
    if (driver?.vehicleId) {
      // Liberar el vehículo
      setVehicles(
        vehicles.map(vehicle =>
          vehicle.id === driver.vehicleId
            ? { ...vehicle, status: 'available', driverId: undefined }
            : vehicle
        )
      )

      // Quitar la referencia del vehículo al conductor
      updateDriver(driverId, { vehicleId: undefined })
    }
  }

  const getDriverVehicle = (driverId: string) => {
    const driver = drivers.find(d => d.id === driverId)
    if (!driver?.vehicleId) return undefined
    return vehicles.find(v => v.id === driver.vehicleId)
  }

  const getVehicleDriver = (vehicleId: string) => {
    const vehicle = vehicles.find(v => v.id === vehicleId)
    if (!vehicle?.driverId) return undefined
    return drivers.find(d => d.id === vehicle.driverId)
  }

  const getAvailableVehicles = () => {
    return vehicles.filter(v => v.status === 'available')
  }

  const getActiveDrivers = () => {
    return drivers.filter(d => d.status === 'active')
  }

  return (
    <FleetContext.Provider
      value={{
        vehicles,
        drivers,
        isLoading,
        addVehicle,
        updateVehicle,
        deleteVehicle,
        addDriver,
        updateDriver,
        deleteDriver,
        assignVehicle,
        unassignVehicle,
        getDriverVehicle,
        getVehicleDriver,
        getAvailableVehicles,
        getActiveDrivers,
        refreshDrivers
      }}
    >
      {children}
    </FleetContext.Provider>
  )
}

export function useFleet() {
  const context = useContext(FleetContext)
  if (context === undefined) {
    throw new Error('useFleet must be used within a FleetProvider')
  }
  return context
}
