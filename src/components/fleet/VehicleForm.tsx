
import { useState } from "react";
import { useFleet } from "@/contexts/FleetContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Vehicle } from "@/types/fleet";

interface VehicleFormProps {
  vehicle?: Vehicle;
  onSave: () => void;
}

export function VehicleForm({ vehicle, onSave }: VehicleFormProps) {
  const { addVehicle, updateVehicle } = useFleet();
  const isEditing = !!vehicle;

  const [formData, setFormData] = useState({
    brand: vehicle?.brand || "",
    model: vehicle?.model || "",
    plate: vehicle?.plate || "",
    status: vehicle?.status || "available"
  });

  const [errors, setErrors] = useState({
    brand: "",
    model: "",
    plate: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when field is edited
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleStatusChange = (value: string) => {
    setFormData(prev => ({ ...prev, status: value as "available" | "assigned" }));
  };

  const validateForm = () => {
    const newErrors = {
      brand: formData.brand ? "" : "La marca es obligatoria",
      model: formData.model ? "" : "El modelo es obligatorio",
      plate: formData.plate ? "" : "La matrícula es obligatoria",
    };

    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    if (isEditing && vehicle) {
      updateVehicle(vehicle.id, formData);
    } else {
      addVehicle(formData);
    }
    
    onSave();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="brand">Marca</Label>
          <Input
            id="brand"
            name="brand"
            placeholder="Ej: Ford"
            value={formData.brand}
            onChange={handleChange}
          />
          {errors.brand && <p className="text-xs text-red-500">{errors.brand}</p>}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="model">Modelo</Label>
          <Input
            id="model"
            name="model"
            placeholder="Ej: Transit"
            value={formData.model}
            onChange={handleChange}
          />
          {errors.model && <p className="text-xs text-red-500">{errors.model}</p>}
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="plate">Matrícula</Label>
          <Input
            id="plate"
            name="plate"
            placeholder="Ej: ABC1234"
            value={formData.plate}
            onChange={handleChange}
          />
          {errors.plate && <p className="text-xs text-red-500">{errors.plate}</p>}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="status">Estado</Label>
          <Select 
            value={formData.status}
            onValueChange={handleStatusChange}
            disabled={!isEditing}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecciona un estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="available">Disponible</SelectItem>
              <SelectItem value="assigned">Asignado</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onSave}>
          Cancelar
        </Button>
        <Button type="submit">
          {isEditing ? "Actualizar" : "Añadir"} Vehículo
        </Button>
      </div>
    </form>
  );
}
