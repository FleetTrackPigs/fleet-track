
import { useState } from "react";
import { useFleet } from "@/contexts/FleetContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Driver } from "@/types/fleet";

interface DriverFormProps {
  driver?: Driver;
  onSave: () => void;
}

export function DriverForm({ driver, onSave }: DriverFormProps) {
  const { addDriver, updateDriver } = useFleet();
  const isEditing = !!driver;

  const [formData, setFormData] = useState({
    name: driver?.name || "",
    lastName: driver?.lastName || "",
    username: driver?.username || "",
    password: "", // Solo para nuevos conductores
    status: driver?.status || "active"
  });

  const [errors, setErrors] = useState({
    name: "",
    lastName: "",
    username: "",
    password: "",
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
    setFormData(prev => ({ ...prev, status: value as "active" | "inactive" }));
  };

  const validateForm = () => {
    const newErrors = {
      name: formData.name ? "" : "El nombre es obligatorio",
      lastName: formData.lastName ? "" : "Los apellidos son obligatorios",
      username: formData.username ? "" : "El nombre de usuario es obligatorio",
      password: !isEditing && !formData.password ? "La contraseña es obligatoria" : "",
    };

    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    if (isEditing && driver) {
      // No enviamos la contraseña si está vacía para mantener la anterior
      const dataToUpdate = {...formData};
      if (!dataToUpdate.password) {
        delete dataToUpdate.password;
      }
      updateDriver(driver.id, dataToUpdate);
    } else {
      addDriver(formData);
    }
    
    onSave();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Nombre</Label>
          <Input
            id="name"
            name="name"
            placeholder="Ej: Juan"
            value={formData.name}
            onChange={handleChange}
          />
          {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="lastName">Apellidos</Label>
          <Input
            id="lastName"
            name="lastName"
            placeholder="Ej: Pérez"
            value={formData.lastName}
            onChange={handleChange}
          />
          {errors.lastName && <p className="text-xs text-red-500">{errors.lastName}</p>}
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="username">Usuario</Label>
          <Input
            id="username"
            name="username"
            placeholder="Ej: juan.perez"
            value={formData.username}
            onChange={handleChange}
          />
          {errors.username && <p className="text-xs text-red-500">{errors.username}</p>}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="password">Contraseña {isEditing && "(Dejar en blanco para mantener)"}</Label>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder={isEditing ? "••••••••" : "Contraseña"}
            value={formData.password}
            onChange={handleChange}
          />
          {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="status">Estado</Label>
        <Select 
          value={formData.status}
          onValueChange={handleStatusChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecciona un estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Activo</SelectItem>
            <SelectItem value="inactive">Inactivo</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onSave}>
          Cancelar
        </Button>
        <Button type="submit">
          {isEditing ? "Actualizar" : "Añadir"} Conductor
        </Button>
      </div>
    </form>
  );
}
