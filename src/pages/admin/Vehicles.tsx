
import { useState } from 'react';
import { useFleet } from '@/contexts/FleetContext';
import AdminLayout from '@/components/layout/AdminLayout';
import { VehicleForm } from '@/components/fleet/VehicleForm';
import { VehicleStatusBadge } from '@/components/fleet/VehicleStatusBadge';
import { ModalForm } from '@/components/ui/modal-form';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Car, Pencil, Trash, Search } from 'lucide-react';
import { Vehicle } from '@/types/fleet';

const VehiclesPage = () => {
  const { vehicles, deleteVehicle, getVehicleDriver } = useFleet();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredVehicles = vehicles.filter(vehicle => 
    vehicle.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
    vehicle.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
    vehicle.plate.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAdd = () => {
    setSelectedVehicle(undefined);
    setIsModalOpen(true);
  };

  const handleEdit = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedVehicle(undefined);
  };

  return (
    <AdminLayout>
      <div className="container py-6">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Gestión de Vehículos</h2>
            <p className="text-muted-foreground">
              Añade, edita o elimina vehículos del sistema
            </p>
          </div>
          <Button className="mt-4 sm:mt-0" onClick={handleAdd}>
            <Car className="mr-2 h-4 w-4" />
            Añadir Vehículo
          </Button>
        </div>

        <div className="mb-6 flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar vehículos..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="rounded-md border">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th className="w-[250px]">Vehículo</th>
                  <th>Matrícula</th>
                  <th>Estado</th>
                  <th>Conductor</th>
                  <th className="text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredVehicles.length > 0 ? (
                  filteredVehicles.map((vehicle) => {
                    const assignedDriver = getVehicleDriver(vehicle.id);
                    return (
                      <tr key={vehicle.id}>
                        <td className="font-medium">
                          {vehicle.brand} {vehicle.model}
                        </td>
                        <td>{vehicle.plate}</td>
                        <td>
                          <VehicleStatusBadge status={vehicle.status} />
                        </td>
                        <td>
                          {assignedDriver ? (
                            `${assignedDriver.name} ${assignedDriver.lastName}`
                          ) : (
                            <span className="text-muted-foreground">No asignado</span>
                          )}
                        </td>
                        <td className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="ghost" size="icon" onClick={() => handleEdit(vehicle)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <Trash className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Esta acción eliminará permanentemente el vehículo {vehicle.brand} {vehicle.model} ({vehicle.plate}).
                                    {vehicle.status === 'assigned' && " También se desasignará del conductor actual."}
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction 
                                    onClick={() => deleteVehicle(vehicle.id)}
                                    className="bg-destructive text-destructive-foreground"
                                  >
                                    Eliminar
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="text-center py-6 text-muted-foreground">
                      No se encontraron vehículos
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <ModalForm
          title={selectedVehicle ? "Editar Vehículo" : "Añadir Vehículo"}
          description={selectedVehicle ? "Actualiza los datos del vehículo" : "Introduce los datos del nuevo vehículo"}
          open={isModalOpen}
          onClose={handleModalClose}
        >
          <VehicleForm vehicle={selectedVehicle} onSave={handleModalClose} />
        </ModalForm>
      </div>
    </AdminLayout>
  );
};

export default VehiclesPage;
