
import AdminLayout from '@/components/layout/AdminLayout';
import { VehicleMap } from '@/components/map/VehicleMap';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useFleet } from '@/contexts/FleetContext';
import { Badge } from '@/components/ui/badge';
import { Car, Truck, AlertTriangle } from 'lucide-react';

const MapPage = () => {
  const { vehicles, getVehicleDriver } = useFleet();
  const assignedVehicles = vehicles.filter(v => v.status === 'assigned');
  const availableVehicles = vehicles.filter(v => v.status === 'available');

  return (
    <AdminLayout>
      <div className="container py-6">
        <div className="mb-6">
          <h2 className="text-3xl font-bold tracking-tight">Mapa de Vehículos</h2>
          <p className="text-muted-foreground">
            Visualiza la ubicación de los vehículos de la flota
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xl">Ubicación en tiempo real</CardTitle>
                <CardDescription>Mapa simulado de la flota</CardDescription>
              </CardHeader>
              <CardContent>
                <VehicleMap />
              </CardContent>
            </Card>
          </div>
          
          <div className="space-y-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xl">Resumen</CardTitle>
                <CardDescription>Estado de la flota</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="flex items-center">
                      <Car className="h-5 w-5 mr-2 text-primary" />
                      <span>Total vehículos</span>
                    </span>
                    <Badge variant="outline">{vehicles.length}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="flex items-center">
                      <Truck className="h-5 w-5 mr-2 text-green-500" />
                      <span>Vehículos asignados</span>
                    </span>
                    <Badge variant="outline" className="bg-green-50">{assignedVehicles.length}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="flex items-center">
                      <AlertTriangle className="h-5 w-5 mr-2 text-amber-500" />
                      <span>Vehículos disponibles</span>
                    </span>
                    <Badge variant="outline" className="bg-amber-50">{availableVehicles.length}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xl">Últimos movimientos</CardTitle>
                <CardDescription>Actividad reciente</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {assignedVehicles.slice(0, 5).map(vehicle => {
                    const driver = getVehicleDriver(vehicle.id);
                    return (
                      <div key={vehicle.id} className="text-sm border-b pb-2 last:border-0">
                        <p className="font-medium">{vehicle.brand} {vehicle.model}</p>
                        <p className="text-muted-foreground">
                          Conductor: {driver?.name} {driver?.lastName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Actualizado hace {Math.floor(Math.random() * 59) + 1} minutos
                        </p>
                      </div>
                    );
                  })}
                  
                  {assignedVehicles.length === 0 && (
                    <div className="text-sm text-muted-foreground text-center py-4">
                      No hay vehículos asignados
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default MapPage;
