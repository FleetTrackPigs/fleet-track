
import AdminLayout from '@/components/layout/AdminLayout';
import { AssignmentForm } from '@/components/fleet/AssignmentForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRightLeft } from 'lucide-react';

const AssignPage = () => {
  return (
    <AdminLayout>
      <div className="container py-6">
        <div className="mb-8">
          <h2 className="text-3xl font-bold tracking-tight">Asignación de Vehículos</h2>
          <p className="text-muted-foreground">
            Asigna o desasigna vehículos a los conductores
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2">
                <ArrowRightLeft className="h-5 w-5 text-primary" />
                <CardTitle>Asignar Vehículo</CardTitle>
              </div>
              <CardDescription>
                Selecciona un conductor y un vehículo disponible para asignarlo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AssignmentForm onSave={() => {}} />
            </CardContent>
          </Card>
          
          <div className="order-first md:order-last">
            <div className="space-y-4">
              <div className="rounded-lg border bg-card p-6">
                <h3 className="mb-2 text-lg font-medium">Instrucciones de Asignación</h3>
                <ul className="ml-6 list-disc space-y-2 text-muted-foreground">
                  <li>Selecciona primero un conductor activo del sistema.</li>
                  <li>Si el conductor ya tiene un vehículo asignado, se mostrará y podrás desasignarlo.</li>
                  <li>Para asignar un nuevo vehículo, selecciona uno de los disponibles en la lista.</li>
                  <li>Un conductor solo puede tener un vehículo asignado a la vez.</li>
                  <li>Un vehículo solo puede estar asignado a un conductor a la vez.</li>
                </ul>
              </div>
              
              <div className="rounded-lg border bg-muted/50 p-6">
                <h3 className="mb-2 text-lg font-medium">Notas importantes</h3>
                <ul className="ml-6 list-disc space-y-2 text-muted-foreground">
                  <li>Al desasignar un vehículo, éste queda disponible para asignarlo a otro conductor.</li>
                  <li>Solo se pueden asignar vehículos a conductores con estado 'Activo'.</li>
                  <li>Las asignaciones se reflejan automáticamente en el panel del conductor.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AssignPage;
