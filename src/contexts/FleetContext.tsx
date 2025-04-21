import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useCallback
} from 'react'
import { Vehicle, Driver } from '@/types/fleet'
import { useToast } from '@/components/ui/use-toast'
import { driverApi, vehicleApi } from '@/services/api'
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
  createVehicle: (vehicleData: {
    brand: string
    model: string
    plate: string
  }) => Promise<void>
  updateVehicle: (
    id: string,
    vehicleData: {
      brand?: string
      model?: string
      plate?: string
      driverId?: string | null
    }
  ) => Promise<void>
  deleteVehicle: (id: string) => Promise<void>
  refreshVehicles: () => Promise<void>
  addDriver: (
    driver: Omit<Driver, 'id' | 'userid' | 'lastname'> & {
      userId: string
      lastName: string
    }
  ) => Promise<void>
  updateDriver: (
    id: string,
    driver: Partial<
      Omit<Driver, 'userid' | 'lastname'> & {
        lastName?: string
        vehicleId?: string | null
      }
    >
  ) => Promise<void>
  deleteDriver: (id: string) => Promise<void>
  refreshDrivers: () => Promise<void>
  getDriverVehicle: (driverId: string) => Vehicle | undefined
  getVehicleDriver: (vehicleId: string) => Driver | undefined
  getAvailableDrivers: () => Driver[]
  getAvailableVehicles: () => Vehicle[]
}

const FleetContext = createContext<FleetContextType | undefined>(undefined)

export function FleetProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast()
  const { token } = useAuth()
  const [isLoading, setIsLoading] = useState(false)

  // State for vehicles and drivers from API
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [drivers, setDrivers] = useState<Driver[]>([])

  // --- API Refresh Functions ---
  const refreshDrivers = useCallback(async () => {
    if (!token) return
    setIsLoading(true)
    console.log('Refreshing drivers...')
    try {
      const response = await driverApi.getAllDrivers(token)
      console.log('Raw driver API response:', response)
      if (response.data) {
        // API may return the data array directly or nested in a data property
        const driversData = Array.isArray(response.data)
          ? response.data
          : response.data.data || []
        console.log('Processed drivers data:', driversData)
        setDrivers(driversData as Driver[])
      } else if (response.error) {
        throw new Error(response.error)
      }
    } catch (error: any) {
      console.error('Error fetching drivers:', error)
      toast({
        title: 'Error',
        description: error.message || 'No se pudieron cargar los conductores',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }, [token, toast])

  const refreshVehicles = useCallback(async () => {
    if (!token) return
    setIsLoading(true)
    console.log('Refreshing vehicles...')
    try {
      const response = await vehicleApi.getAllVehicles(token)
      console.log('Raw vehicle API response:', response)
      if (response.data) {
        // API may return the data array directly or nested in a data property
        const vehiclesData = Array.isArray(response.data)
          ? response.data
          : response.data.data || []
        console.log('Processed vehicles data:', vehiclesData)
        setVehicles(vehiclesData as Vehicle[])
      } else if (response.error) {
        throw new Error(response.error)
      }
    } catch (error: any) {
      console.error('Error fetching vehicles:', error)
      toast({
        title: 'Error',
        description: error.message || 'No se pudieron cargar los vehículos',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }, [token, toast])

  // Initial load
  useEffect(() => {
    if (token) {
      refreshDrivers()
      refreshVehicles()
    }
  }, [token, refreshDrivers, refreshVehicles])

  // --- Vehicle API Functions ---
  const createVehicle = async (vehicleData: {
    brand: string
    model: string
    plate: string
  }) => {
    if (!token) return
    setIsLoading(true)
    try {
      const response = await vehicleApi.createVehicle(vehicleData, token)
      if (response.data?.data) {
        await refreshVehicles()
        toast({
          title: 'Vehículo añadido',
          description: `${vehicleData.brand} ${vehicleData.model} (${vehicleData.plate}) añadido.`
        })
      } else if (response.error) {
        throw new Error(response.error)
      }
    } catch (error: any) {
      console.error('Error creating vehicle:', error)
      toast({
        title: 'Error al crear vehículo',
        description: error.message || 'No se pudo añadir el vehículo.',
        variant: 'destructive'
      })
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const updateVehicle = async (
    id: string,
    vehicleData: {
      brand?: string
      model?: string
      plate?: string
      driverId?: string | null
    }
  ) => {
    if (!token) return
    setIsLoading(true)
    try {
      const response = await vehicleApi.updateVehicle(id, vehicleData, token)
      if (response.data?.data) {
        await Promise.all([refreshVehicles(), refreshDrivers()])
        toast({
          title: 'Vehículo actualizado',
          description: 'Datos del vehículo actualizados.'
        })
      } else if (response.error) {
        throw new Error(response.error)
      }
    } catch (error: any) {
      console.error('Error updating vehicle:', error)
      toast({
        title: 'Error al actualizar vehículo',
        description: error.message || 'No se pudo actualizar el vehículo.',
        variant: 'destructive'
      })
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const deleteVehicle = async (id: string) => {
    if (!token) return
    setIsLoading(true)
    try {
      const response = await vehicleApi.deleteVehicle(id, token)
      if (response.data !== undefined) {
        await Promise.all([refreshVehicles(), refreshDrivers()])
        toast({
          title: 'Vehículo eliminado',
          description: 'Vehículo eliminado correctamente.'
        })
      } else if (response.error) {
        throw new Error(response.error)
      }
    } catch (error: any) {
      console.error('Error deleting vehicle:', error)
      toast({
        title: 'Error al eliminar vehículo',
        description: error.message || 'No se pudo eliminar el vehículo.',
        variant: 'destructive'
      })
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  // --- Driver API Functions (Keep existing ones, ensure they refresh) ---
  const addDriver = async (
    driverData: Omit<Driver, 'id' | 'userid' | 'lastname'> & {
      userId: string
      lastName: string
    }
  ) => {
    if (!token) return
    setIsLoading(true)
    try {
      const apiData = {
        userId: driverData.userId,
        name: driverData.name,
        lastName: driverData.lastName,
        phone: driverData.phone,
        license_type: driverData.license_type,
        license_expiry: driverData.license_expiry,
        status: driverData.status
      }
      const response = await driverApi.createDriver(apiData, token)
      if (response.data?.data) {
        await refreshDrivers()
        toast({
          title: 'Conductor añadido',
          description: `${driverData.name} ${driverData.lastName} ha sido añadido.`
        })
      } else if (response.error) {
        throw new Error(response.error)
      }
    } catch (error: any) {
      console.error('Error adding driver:', error)
      toast({
        title: 'Error al añadir conductor',
        description: error.message || 'No se pudo añadir el conductor',
        variant: 'destructive'
      })
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const updateDriver = async (
    id: string,
    driverData: Partial<
      Omit<Driver, 'userid' | 'lastname'> & {
        lastName?: string
        vehicleId?: string | null
      }
    >
  ) => {
    if (!token) return
    setIsLoading(true)
    try {
      // Map frontend camelCase to backend lowercase field names
      const apiData = {
        ...driverData,
        // If lastName is provided, map it correctly to lastname for API
        ...(driverData.lastName && { lastName: driverData.lastName }),
        // Map vehicleId to vehicleid for the API
        ...(driverData.vehicleId !== undefined && {
          vehicleId: driverData.vehicleId
        })
      }
      const response = await driverApi.updateDriver(id, apiData, token)
      if (response.data?.data) {
        await Promise.all([refreshDrivers(), refreshVehicles()])
        toast({
          title: 'Conductor actualizado',
          description: 'Datos del conductor actualizados.'
        })
      } else if (response.error) {
        throw new Error(response.error)
      }
    } catch (error: any) {
      console.error('Error updating driver:', error)
      toast({
        title: 'Error al actualizar conductor',
        description: error.message || 'No se pudo actualizar el conductor',
        variant: 'destructive'
      })
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const deleteDriver = async (id: string) => {
    if (!token) return
    setIsLoading(true)
    try {
      const response = await driverApi.deleteDriver(id, token)
      if (response.data !== undefined) {
        await Promise.all([refreshDrivers(), refreshVehicles()])
        toast({
          title: 'Conductor eliminado',
          description: 'Conductor eliminado correctamente.'
        })
      } else if (response.error) {
        throw new Error(response.error)
      }
    } catch (error: any) {
      console.error('Error deleting driver:', error)
      toast({
        title: 'Error al eliminar conductor',
        description: error.message || 'No se pudo eliminar el conductor.',
        variant: 'destructive'
      })
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  // --- Helper Functions ---

  // Get vehicle assigned to a specific driver
  const getDriverVehicle = (driverId: string): Vehicle | undefined => {
    const driver = drivers.find(d => d.id === driverId)
    return vehicles.find(v => v.id === driver?.vehicleid)
  }

  // Get driver assigned to a specific vehicle
  const getVehicleDriver = (vehicleId: string): Driver | undefined => {
    // Search for driver with this vehicleid
    return drivers.find(d => d.vehicleid === vehicleId)
  }

  // Get drivers that are active and not assigned to any vehicle
  const getAvailableDrivers = (): Driver[] => {
    return drivers.filter(d => d.status === 'active' && !d.vehicleid)
  }

  // Get available vehicles
  const getAvailableVehicles = (): Vehicle[] => {
    return vehicles.filter(v => v.status === 'available')
  }

  // --- Context Value ---
  const value = {
    vehicles,
    drivers,
    isLoading,
    createVehicle,
    updateVehicle,
    deleteVehicle,
    refreshVehicles,
    addDriver,
    updateDriver,
    deleteDriver,
    refreshDrivers,
    getDriverVehicle,
    getVehicleDriver,
    getAvailableDrivers,
    getAvailableVehicles
  }

  return <FleetContext.Provider value={value}>{children}</FleetContext.Provider>
}

export function useFleet() {
  const context = useContext(FleetContext)
  if (context === undefined) {
    throw new Error('useFleet must be used within a FleetProvider')
  }
  return context
}
