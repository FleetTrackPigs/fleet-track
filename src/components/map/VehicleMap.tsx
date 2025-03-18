
import { useState, useEffect } from 'react';
import { useFleet } from '@/contexts/FleetContext';
import { Card } from '@/components/ui/card';
import { MapPin, Car, Truck } from 'lucide-react';
import { Vehicle } from '@/types/fleet';

const generateRandomPosition = () => {
  // Spain-like coordinates
  const lat = 40 + (Math.random() * 2) - 1; // Around 39-41 (central Spain)
  const lng = -3.5 + (Math.random() * 3) - 1.5; // Around -5 to -2 (central Spain)
  return { lat, lng };
};

interface VehicleMarker extends Vehicle {
  position: { lat: number; lng: number };
}

export const VehicleMap = () => {
  const { vehicles, getVehicleDriver } = useFleet();
  const [vehicleMarkers, setVehicleMarkers] = useState<VehicleMarker[]>([]);

  useEffect(() => {
    // Generate random positions for all vehicles
    const markers = vehicles.map(vehicle => ({
      ...vehicle,
      position: generateRandomPosition()
    }));
    setVehicleMarkers(markers);

    // Update positions slightly every few seconds to simulate movement
    const interval = setInterval(() => {
      setVehicleMarkers(prev => 
        prev.map(marker => ({
          ...marker,
          position: {
            lat: marker.position.lat + (Math.random() * 0.01 - 0.005),
            lng: marker.position.lng + (Math.random() * 0.01 - 0.005)
          }
        }))
      );
    }, 3000);

    return () => clearInterval(interval);
  }, [vehicles]);

  return (
    <div className="relative w-full h-[600px] rounded-lg overflow-hidden">
      {/* Fake map background */}
      <div className="absolute inset-0 bg-gray-100">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e5e7eb" strokeWidth="1"/>
          </pattern>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Vehicle markers */}
      {vehicleMarkers.map(vehicle => {
        const driver = getVehicleDriver(vehicle.id);
        const isAssigned = vehicle.status === 'assigned';
        // Convert lat/lng to pixel positions (fake projection)
        const x = ((vehicle.position.lng + 5) / 10) * 100 + '%';
        const y = (1 - (vehicle.position.lat - 36) / 5) * 100 + '%';

        return (
          <div
            key={vehicle.id}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 z-10"
            style={{ left: x, top: y }}
          >
            <div className="relative group">
              <div className={`p-1 rounded-full ${isAssigned ? 'bg-green-500' : 'bg-amber-500'}`}>
                {vehicle.brand.toLowerCase().includes('truck') || vehicle.model.toLowerCase().includes('truck') ? (
                  <Truck className="h-6 w-6 text-white" />
                ) : (
                  <Car className="h-6 w-6 text-white" />
                )}
              </div>
              <Card className="absolute bottom-full mb-2 p-2 hidden group-hover:block shadow-lg text-xs w-40">
                <p className="font-bold">{vehicle.brand} {vehicle.model}</p>
                <p>{vehicle.plate}</p>
                {isAssigned && driver ? (
                  <p className="text-green-600">Conductor: {driver.name} {driver.lastName}</p>
                ) : (
                  <p className="text-amber-600">Disponible</p>
                )}
              </Card>
            </div>
          </div>
        );
      })}

      {/* Map controls (decorative) */}
      <div className="absolute top-4 right-4 bg-white p-2 rounded-md shadow-md flex flex-col gap-2">
        <button className="w-8 h-8 flex items-center justify-center border rounded hover:bg-gray-100">+</button>
        <button className="w-8 h-8 flex items-center justify-center border rounded hover:bg-gray-100">−</button>
      </div>

      {/* Map attribution */}
      <div className="absolute bottom-2 right-2 text-xs text-gray-500">
        Mapa de Simulación - No representa ubicaciones reales
      </div>
    </div>
  );
};
