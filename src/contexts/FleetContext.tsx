
import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Vehicle, Driver } from '@/types/fleet';
import { useToast } from '@/components/ui/use-toast';

// Datos de prueba iniciales
const INITIAL_VEHICLES: Vehicle[] = [
  { id: '1', brand: 'Ford', model: 'Transit', plate: 'ABC1234', status: 'available' },
  { id: '2', brand: 'Mercedes', model: 'Sprinter', plate: 'XYZ5678', status: 'available' },
  { id: '3', brand: 'Iveco', model: 'Daily', plate: 'DEF9012', status: 'available' },
];

const INITIAL_DRIVERS: Driver[] = [
  { id: '1', name: 'Juan', lastName: 'Pérez', username: 'driver', status: 'active' },
  { id: '2', name: 'Ana', lastName: 'Martínez', username: 'ana.martinez', status: 'active' },
  { id: '3', name: 'Miguel', lastName: 'González', username: 'miguel.gonzalez', status: 'inactive' },
];

interface FleetContextType {
  vehicles: Vehicle[];
  drivers: Driver[];
  addVehicle: (vehicle: Omit<Vehicle, 'id'>) => void;
  updateVehicle: (id: string, vehicle: Partial<Vehicle>) => void;
  deleteVehicle: (id: string) => void;
  addDriver: (driver: Omit<Driver, 'id'>) => void;
  updateDriver: (id: string, driver: Partial<Driver>) => void;
  deleteDriver: (id: string) => void;
  assignVehicle: (driverId: string, vehicleId: string) => void;
  unassignVehicle: (driverId: string) => void;
  getDriverVehicle: (driverId: string) => Vehicle | undefined;
  getVehicleDriver: (vehicleId: string) => Driver | undefined;
  getAvailableVehicles: () => Vehicle[];
  getActiveDrivers: () => Driver[];
}

const FleetContext = createContext<FleetContextType | undefined>(undefined);

export function FleetProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  
  const [vehicles, setVehicles] = useState<Vehicle[]>(() => {
    const stored = localStorage.getItem('flotaVehicles');
    return stored ? JSON.parse(stored) : INITIAL_VEHICLES;
  });
  
  const [drivers, setDrivers] = useState<Driver[]>(() => {
    const stored = localStorage.getItem('flotaDrivers');
    return stored ? JSON.parse(stored) : INITIAL_DRIVERS;
  });

  useEffect(() => {
    localStorage.setItem('flotaVehicles', JSON.stringify(vehicles));
  }, [vehicles]);

  useEffect(() => {
    localStorage.setItem('flotaDrivers', JSON.stringify(drivers));
  }, [drivers]);

  const addVehicle = (vehicle: Omit<Vehicle, 'id'>) => {
    const newVehicle = { ...vehicle, id: crypto.randomUUID() };
    setVehicles([...vehicles, newVehicle]);
    toast({
      title: "Vehículo añadido",
      description: `${vehicle.brand} ${vehicle.model} (${vehicle.plate}) ha sido añadido correctamente.`
    });
  };

  const updateVehicle = (id: string, updatedVehicle: Partial<Vehicle>) => {
    setVehicles(vehicles.map(vehicle => 
      vehicle.id === id ? { ...vehicle, ...updatedVehicle } : vehicle
    ));
    toast({
      title: "Vehículo actualizado",
      description: "Los datos del vehículo han sido actualizados."
    });
  };

  const deleteVehicle = (id: string) => {
    // Verificar si el vehículo está asignado
    const vehicleToDelete = vehicles.find(v => v.id === id);
    if (vehicleToDelete?.status === 'assigned') {
      // Desasignar el vehículo del conductor
      const driverWithVehicle = drivers.find(d => d.vehicleId === id);
      if (driverWithVehicle) {
        setDrivers(drivers.map(driver => 
          driver.id === driverWithVehicle.id ? { ...driver, vehicleId: undefined } : driver
        ));
      }
    }

    setVehicles(vehicles.filter(vehicle => vehicle.id !== id));
    toast({
      title: "Vehículo eliminado",
      description: "El vehículo ha sido eliminado correctamente."
    });
  };

  const addDriver = (driver: Omit<Driver, 'id'>) => {
    const newDriver = { ...driver, id: crypto.randomUUID() };
    setDrivers([...drivers, newDriver]);
    toast({
      title: "Conductor añadido",
      description: `${driver.name} ${driver.lastName} ha sido añadido correctamente.`
    });
  };

  const updateDriver = (id: string, updatedDriver: Partial<Driver>) => {
    setDrivers(drivers.map(driver => 
      driver.id === id ? { ...driver, ...updatedDriver } : driver
    ));
    toast({
      title: "Conductor actualizado",
      description: "Los datos del conductor han sido actualizados."
    });
  };

  const deleteDriver = (id: string) => {
    // Verificar si el conductor tiene un vehículo asignado
    const driverToDelete = drivers.find(d => d.id === id);
    if (driverToDelete?.vehicleId) {
      // Liberar el vehículo asignado
      setVehicles(vehicles.map(vehicle => 
        vehicle.id === driverToDelete.vehicleId 
          ? { ...vehicle, status: 'available', driverId: undefined } 
          : vehicle
      ));
    }

    setDrivers(drivers.filter(driver => driver.id !== id));
    toast({
      title: "Conductor eliminado",
      description: "El conductor ha sido eliminado correctamente."
    });
  };

  const assignVehicle = (driverId: string, vehicleId: string) => {
    // Verificar si el conductor ya tiene un vehículo asignado
    const driver = drivers.find(d => d.id === driverId);
    if (driver?.vehicleId) {
      // Liberar el vehículo anterior
      setVehicles(vehicles.map(vehicle => 
        vehicle.id === driver.vehicleId 
          ? { ...vehicle, status: 'available', driverId: undefined } 
          : vehicle
      ));
    }

    // Asignar el nuevo vehículo al conductor
    setDrivers(drivers.map(driver => 
      driver.id === driverId ? { ...driver, vehicleId } : driver
    ));

    // Actualizar el estado del vehículo
    setVehicles(vehicles.map(vehicle => 
      vehicle.id === vehicleId 
        ? { ...vehicle, status: 'assigned', driverId } 
        : vehicle
    ));

    toast({
      title: "Vehículo asignado",
      description: "El vehículo ha sido asignado correctamente al conductor."
    });
  };

  const unassignVehicle = (driverId: string) => {
    const driver = drivers.find(d => d.id === driverId);
    if (driver?.vehicleId) {
      // Liberar el vehículo
      setVehicles(vehicles.map(vehicle => 
        vehicle.id === driver.vehicleId 
          ? { ...vehicle, status: 'available', driverId: undefined } 
          : vehicle
      ));

      // Quitar la referencia del vehículo al conductor
      setDrivers(drivers.map(driver => 
        driver.id === driverId ? { ...driver, vehicleId: undefined } : driver
      ));

      toast({
        title: "Vehículo desasignado",
        description: "El vehículo ha sido desasignado correctamente del conductor."
      });
    }
  };

  const getDriverVehicle = (driverId: string) => {
    const driver = drivers.find(d => d.id === driverId);
    if (!driver?.vehicleId) return undefined;
    return vehicles.find(v => v.id === driver.vehicleId);
  };

  const getVehicleDriver = (vehicleId: string) => {
    const vehicle = vehicles.find(v => v.id === vehicleId);
    if (!vehicle?.driverId) return undefined;
    return drivers.find(d => d.id === vehicle.driverId);
  };

  const getAvailableVehicles = () => {
    return vehicles.filter(v => v.status === 'available');
  };

  const getActiveDrivers = () => {
    return drivers.filter(d => d.status === 'active');
  };

  return (
    <FleetContext.Provider value={{
      vehicles,
      drivers,
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
      getActiveDrivers
    }}>
      {children}
    </FleetContext.Provider>
  );
}

export function useFleet() {
  const context = useContext(FleetContext);
  if (context === undefined) {
    throw new Error('useFleet must be used within a FleetProvider');
  }
  return context;
}
