
import { useAuth } from '@/contexts/AuthContext';
import { useFleet } from '@/contexts/FleetContext';
import DriverLayout from '@/components/layout/DriverLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { VehicleStatusBadge } from '@/components/fleet/VehicleStatusBadge';
import { Car, Info, AlertTriangle } from 'lucide-react';

const DriverDashboard = () => {
  const { user } = useAuth();
  const { getDriverVehicle, drivers } = useFleet();

  const currentDriverId = drivers.find(d => d.username === user?.username)?.id || '';
  const assignedVehicle = getDriverVehicle(currentDriverId);

  return (
    <DriverLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Bienvenido, {user?.name} {user?.lastName}
          </h2>
          <p className="text-muted-foreground">
            Panel de control para conductores
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">Mi Vehículo</CardTitle>
              <CardDescription>
                Información sobre tu vehículo asignado
              </CardDescription>
            </CardHeader>
            <CardContent>
              {assignedVehicle ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Car className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-medium">
                      {assignedVehicle.brand} {assignedVehicle.model}
                    </h3>
                  </div>
                  <div className="space-y-2">
                    <div className="grid grid-cols-2">
                      <span className="text-sm text-muted-foreground">Matrícula:</span>
                      <span className="text-sm font-medium">{assignedVehicle.plate}</span>
                    </div>
                    <div className="grid grid-cols-2">
                      <span className="text-sm text-muted-foreground">Estado:</span>
                      <VehicleStatusBadge status={assignedVehicle.status} />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 rounded-lg border border-dashed p-4 text-muted-foreground">
                  <AlertTriangle className="h-5 w-5" />
                  <p>No tienes asignado ningún vehículo actualmente.</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">Incidencias</CardTitle>
              <CardDescription>
                Revisa las incidencias activas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 rounded-lg border border-dashed p-4 text-muted-foreground">
                <Info className="h-5 w-5" />
                <p>No hay incidencias activas en este momento.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DriverLayout>
  );
};

export default DriverDashboard;
