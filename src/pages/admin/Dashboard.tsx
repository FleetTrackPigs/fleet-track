import { useNavigate } from 'react-router-dom'
import { useFleet } from '@/contexts/FleetContext'
import AdminLayout from '@/components/layout/AdminLayout'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users, Truck, ArrowRightLeft, Map } from 'lucide-react'

const AdminDashboard = () => {
  const { drivers, vehicles, getAvailableVehicles } = useFleet()
  const navigate = useNavigate()

  const activeDrivers = drivers.filter(d => d.status === 'active')
  const availableVehicles = getAvailableVehicles()
  const assignedVehicles = vehicles.filter(v => v.status === 'assigned')

  return (
    <AdminLayout>
      <div className="container py-6">
        <div className="mb-8">
          <h2 className="text-3xl font-bold tracking-tight">
            Panel de Administración
          </h2>
          <p className="text-muted-foreground">
            Gestiona conductores, vehículos y asignaciones
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card className="dashboard-card hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">Conductores</CardTitle>
                <Users className="h-8 w-8 text-primary" />
              </div>
              <CardDescription>Gestión de conductores</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mt-2 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Total de conductores:
                  </span>
                  <span className="font-medium">{drivers.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Conductores activos:
                  </span>
                  <span className="font-medium">{activeDrivers.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Conductores inactivos:
                  </span>
                  <span className="font-medium">
                    {drivers.length - activeDrivers.length}
                  </span>
                </div>
              </div>
              <Button
                className="mt-4 w-full"
                onClick={() => navigate('/admin/drivers')}
              >
                Ver conductores
              </Button>
            </CardContent>
          </Card>

          <Card className="dashboard-card hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">Vehículos</CardTitle>
                <Truck className="h-8 w-8 text-primary" />
              </div>
              <CardDescription>Gestión de vehículos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mt-2 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Total de vehículos:
                  </span>
                  <span className="font-medium">{vehicles.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Vehículos disponibles:
                  </span>
                  <span className="font-medium">
                    {availableVehicles.length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Vehículos asignados:
                  </span>
                  <span className="font-medium">{assignedVehicles.length}</span>
                </div>
              </div>
              <Button
                className="mt-4 w-full"
                onClick={() => navigate('/admin/vehicles')}
              >
                Ver vehículos
              </Button>
            </CardContent>
          </Card>

          <Card className="dashboard-card hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">Asignaciones</CardTitle>
                <ArrowRightLeft className="h-8 w-8 text-primary" />
              </div>
              <CardDescription>Asignación de vehículos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mt-2 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Vehículos asignados:
                  </span>
                  <span className="font-medium">{assignedVehicles.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Conductores con vehículo:
                  </span>
                  <span className="font-medium">
                    {drivers.filter(d => d.vehicleid).length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Tasa de utilización:
                  </span>
                  <span className="font-medium">
                    {vehicles.length > 0
                      ? `${Math.round(
                          (assignedVehicles.length / vehicles.length) * 100
                        )}%`
                      : '0%'}
                  </span>
                </div>
              </div>
              <Button
                className="mt-4 w-full"
                onClick={() => navigate('/admin/assign')}
              >
                Gestionar asignaciones
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">Mapa de Vehículos</CardTitle>
                <Map className="h-8 w-8 text-primary" />
              </div>
              <CardDescription>
                Visualiza la ubicación de tus vehículos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" onClick={() => navigate('/admin/map')}>
                Ver mapa
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  )
}

export default AdminDashboard
