
import { useState, useEffect } from "react";
import { useFleet } from "@/contexts/FleetContext";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface AssignmentFormProps {
  onSave: () => void;
}

export function AssignmentForm({ onSave }: AssignmentFormProps) {
  const { 
    getActiveDrivers, 
    getAvailableVehicles, 
    assignVehicle,
    getDriverVehicle,
    unassignVehicle,
    vehicles,
    drivers
  } = useFleet();

  const [selectedDriverId, setSelectedDriverId] = useState("");
  const [selectedVehicleId, setSelectedVehicleId] = useState("");
  const [currentVehicle, setCurrentVehicle] = useState<{id: string, name: string} | null>(null);
  const [error, setError] = useState("");

  const activeDrivers = getActiveDrivers();
  const availableVehicles = getAvailableVehicles();

  useEffect(() => {
    if (selectedDriverId) {
      const driverVehicle = getDriverVehicle(selectedDriverId);
      if (driverVehicle) {
        setCurrentVehicle({
          id: driverVehicle.id,
          name: `${driverVehicle.brand} ${driverVehicle.model} (${driverVehicle.plate})`
        });
      } else {
        setCurrentVehicle(null);
      }
      setSelectedVehicleId("");
    } else {
      setCurrentVehicle(null);
    }
  }, [selectedDriverId, getDriverVehicle, vehicles]);

  const handleDriverChange = (value: string) => {
    setSelectedDriverId(value);
    setError("");
  };

  const handleVehicleChange = (value: string) => {
    setSelectedVehicleId(value);
    setError("");
  };

  const handleAssign = () => {
    if (!selectedDriverId) {
      setError("Debes seleccionar un conductor");
      return;
    }

    if (!selectedVehicleId) {
      setError("Debes seleccionar un vehículo");
      return;
    }

    assignVehicle(selectedDriverId, selectedVehicleId);
    onSave();
  };

  const handleUnassign = () => {
    if (!selectedDriverId) {
      setError("Debes seleccionar un conductor");
      return;
    }

    if (!currentVehicle) {
      setError("Este conductor no tiene un vehículo asignado");
      return;
    }

    unassignVehicle(selectedDriverId);
    onSave();
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="driver">Conductor</Label>
          <Select 
            value={selectedDriverId}
            onValueChange={handleDriverChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecciona un conductor" />
            </SelectTrigger>
            <SelectContent>
              {activeDrivers.map(driver => (
                <SelectItem key={driver.id} value={driver.id}>
                  {driver.name} {driver.lastName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {currentVehicle && (
          <div className="rounded-lg border bg-muted/50 p-4">
            <h4 className="text-sm font-medium">Vehículo asignado actualmente</h4>
            <p className="text-sm">{currentVehicle.name}</p>
            <Button 
              variant="destructive" 
              size="sm" 
              className="mt-2"
              onClick={handleUnassign}
            >
              Desasignar vehículo
            </Button>
          </div>
        )}

        {(!currentVehicle && selectedDriverId) && (
          <>
            <div className="space-y-2">
              <Label htmlFor="vehicle">Vehículo disponible</Label>
              <Select 
                value={selectedVehicleId}
                onValueChange={handleVehicleChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un vehículo" />
                </SelectTrigger>
                <SelectContent>
                  {availableVehicles.map(vehicle => (
                    <SelectItem key={vehicle.id} value={vehicle.id}>
                      {vehicle.brand} {vehicle.model} ({vehicle.plate})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button onClick={handleAssign} disabled={!selectedVehicleId}>
              Asignar vehículo
            </Button>
          </>
        )}

        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>
    </div>
  );
}
