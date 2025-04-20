import { useState, useEffect } from 'react'
import { useFleet } from '@/contexts/FleetContext'
import { useAuth } from '@/contexts/AuthContext'
import AdminLayout from '@/components/layout/AdminLayout'
import { DriverForm } from '@/components/fleet/DriverForm'
import { DriverStatusBadge } from '@/components/fleet/DriverStatusBadge'
import { ModalForm } from '@/components/ui/modal-form'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog'
import { Input } from '@/components/ui/input'
import { UserPlus, Pencil, Trash, Search, RefreshCw } from 'lucide-react'
import { Driver } from '@/types/fleet'
import { useToast } from '@/components/ui/use-toast'

const DriversPage = () => {
  const { drivers, deleteDriver, getDriverVehicle, refreshDrivers, isLoading } =
    useFleet()
  const { token } = useAuth()
  const { toast } = useToast()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedDriver, setSelectedDriver] = useState<Driver | undefined>(
    undefined
  )
  const [searchQuery, setSearchQuery] = useState('')

  // Initial load
  useEffect(() => {
    if (token) {
      refreshDrivers().catch(error => {
        console.error('Error refreshing drivers:', error)
        toast({
          title: 'Error',
          description: 'No se pudieron cargar los conductores',
          variant: 'destructive'
        })
      })
    }
  }, [token, toast])

  const filteredDrivers = drivers.filter(
    driver =>
      driver.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      driver.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      driver.user?.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      driver.user?.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleAdd = () => {
    setSelectedDriver(undefined)
    setIsModalOpen(true)
  }

  const handleEdit = (driver: Driver) => {
    setSelectedDriver(driver)
    setIsModalOpen(true)
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setSelectedDriver(undefined)
  }

  const handleRefresh = () => {
    refreshDrivers().catch(error => {
      console.error('Error refreshing drivers:', error)
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los conductores',
        variant: 'destructive'
      })
    })
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteDriver(id)
    } catch (error) {
      console.error('Error deleting driver:', error)
    }
  }

  return (
    <AdminLayout>
      <div className="container py-6">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">
              Gestión de Conductores
            </h2>
            <p className="text-muted-foreground">
              Añade, edita o elimina conductores del sistema
            </p>
          </div>
          <div className="flex mt-4 sm:mt-0 gap-2">
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={isLoading}
            >
              <RefreshCw
                className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`}
              />
              Actualizar
            </Button>
            <Button onClick={handleAdd} disabled={isLoading}>
              <UserPlus className="mr-2 h-4 w-4" />
              Añadir Conductor
            </Button>
          </div>
        </div>

        <div className="mb-6 flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar conductores..."
              className="pl-8"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="rounded-md border">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th className="w-[300px]">Nombre</th>
                  <th>Usuario</th>
                  <th>Email</th>
                  <th>Estado</th>
                  <th>Vehículo</th>
                  <th className="text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="text-center py-6">
                      <div className="flex justify-center">
                        <RefreshCw className="animate-spin h-5 w-5 mr-2" />
                        Cargando conductores...
                      </div>
                    </td>
                  </tr>
                ) : filteredDrivers.length > 0 ? (
                  filteredDrivers.map(driver => {
                    const assignedVehicle = getDriverVehicle(driver.id)
                    return (
                      <tr key={driver.id}>
                        <td className="font-medium">
                          {driver.name} {driver.lastName}
                        </td>
                        <td>{driver.user?.username}</td>
                        <td>{driver.user?.email}</td>
                        <td>
                          <DriverStatusBadge status={driver.status} />
                        </td>
                        <td>
                          {assignedVehicle ? (
                            `${assignedVehicle.brand} ${assignedVehicle.model} (${assignedVehicle.plate})`
                          ) : (
                            <span className="text-muted-foreground">
                              No asignado
                            </span>
                          )}
                        </td>
                        <td className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(driver)}
                            >
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
                                  <AlertDialogTitle>
                                    ¿Estás seguro?
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Esta acción eliminará permanentemente al
                                    conductor {driver.name} {driver.lastName}.
                                    {assignedVehicle &&
                                      ' También se desasignará su vehículo actual.'}
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>
                                    Cancelar
                                  </AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDelete(driver.id)}
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
                    )
                  })
                ) : (
                  <tr>
                    <td
                      colSpan={6}
                      className="text-center py-6 text-muted-foreground"
                    >
                      No se encontraron conductores
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <ModalForm
          title={selectedDriver ? 'Editar Conductor' : 'Añadir Conductor'}
          description={
            selectedDriver
              ? 'Actualiza los datos del conductor'
              : 'Introduce los datos del nuevo conductor'
          }
          open={isModalOpen}
          onClose={handleModalClose}
        >
          <DriverForm driver={selectedDriver} onSave={handleModalClose} />
        </ModalForm>
      </div>
    </AdminLayout>
  )
}

export default DriversPage
