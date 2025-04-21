import { useState, useEffect } from 'react'
import { useFleet } from '@/contexts/FleetContext'
import AdminLayout from '@/components/layout/AdminLayout'
import { VehicleForm } from '@/components/fleet/VehicleForm'
import { VehicleStatusBadge } from '@/components/fleet/VehicleStatusBadge'
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
import { Car, Pencil, Trash, Search, RefreshCw } from 'lucide-react'
import { Vehicle } from '@/types/fleet'
import { useToast } from '@/components/ui/use-toast'

const VehiclesPage = () => {
  const {
    vehicles,
    drivers,
    deleteVehicle,
    refreshVehicles,
    refreshDrivers,
    isLoading
  } = useFleet()
  const { toast } = useToast()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | undefined>(
    undefined
  )
  const [searchQuery, setSearchQuery] = useState('')

  // Debug output
  useEffect(() => {
    console.log('Vehicles state:', vehicles)
    console.log('Drivers state:', drivers)
    console.log('Is loading:', isLoading)
  }, [vehicles, drivers, isLoading])

  // Force refresh on mount
  useEffect(() => {
    refreshVehicles()
    refreshDrivers()
  }, [refreshVehicles, refreshDrivers])

  const filteredVehicles = vehicles.filter(
    vehicle =>
      vehicle.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vehicle.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vehicle.plate.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (vehicle.driver?.name + ' ' + vehicle.driver?.lastname)
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
  )

  const handleAdd = () => {
    setSelectedVehicle(undefined)
    setIsModalOpen(true)
  }

  const handleEdit = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle)
    setIsModalOpen(true)
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setSelectedVehicle(undefined)
  }

  const handleRefresh = () => {
    Promise.all([refreshVehicles(), refreshDrivers()]).catch(error => {
      console.error('Error refreshing data:', error)
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los datos',
        variant: 'destructive'
      })
    })
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteVehicle(id)
      toast({
        title: 'Vehículo eliminado',
        description: 'Vehículo eliminado correctamente.'
      })
    } catch (error: any) {
      console.error('Error deleting vehicle:', error)
      toast({
        title: 'Error al eliminar',
        description: error.message || 'No se pudo eliminar el vehículo.',
        variant: 'destructive'
      })
    }
  }

  return (
    <AdminLayout>
      <div className="container py-6">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">
              Gestión de Vehículos
            </h2>
            <p className="text-muted-foreground">
              Añade, edita o elimina vehículos del sistema y asígnalos a
              conductores.
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
              <Car className="mr-2 h-4 w-4" />
              Añadir Vehículo
            </Button>
          </div>
        </div>

        <div className="mb-6 flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar vehículos (marca, modelo, matrícula, conductor)..."
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
                  <th>Marca</th>
                  <th>Modelo</th>
                  <th>Matrícula</th>
                  <th>Estado</th>
                  <th>Conductor Asignado</th>
                  <th className="text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {isLoading && vehicles.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-6">
                      <div className="flex justify-center items-center">
                        <RefreshCw className="animate-spin h-5 w-5 mr-2" />
                        Cargando vehículos...
                      </div>
                    </td>
                  </tr>
                ) : filteredVehicles.length > 0 ? (
                  filteredVehicles.map(vehicle => (
                    <tr key={vehicle.id}>
                      <td className="font-medium">{vehicle.brand}</td>
                      <td>{vehicle.model}</td>
                      <td>{vehicle.plate}</td>
                      <td>
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            vehicle.status === 'assigned'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-green-100 text-green-800'
                          }`}
                        >
                          {vehicle.status === 'assigned'
                            ? 'Asignado'
                            : 'Disponible'}
                        </span>
                      </td>
                      <td>
                        {vehicle.driver ? (
                          `${vehicle.driver.name} ${vehicle.driver.lastname}`
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
                            onClick={() => handleEdit(vehicle)}
                            disabled={isLoading}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                disabled={isLoading}
                              >
                                <Trash className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  ¿Estás seguro?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Esta acción eliminará permanentemente el
                                  vehículo {vehicle.brand} {vehicle.model} (
                                  {vehicle.plate}).
                                  {vehicle.driver &&
                                    ' También se desasignará de su conductor actual.'}
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(vehicle.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Eliminar
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={6}
                      className="text-center py-6 text-muted-foreground"
                    >
                      No se encontraron vehículos{' '}
                      {searchQuery && ' que coincidan con la búsqueda'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <ModalForm
          title={selectedVehicle ? 'Editar Vehículo' : 'Añadir Vehículo'}
          description={
            selectedVehicle
              ? 'Actualiza los datos del vehículo y asigna un conductor.'
              : 'Introduce los datos del nuevo vehículo.'
          }
          open={isModalOpen}
          onClose={handleModalClose}
        >
          <VehicleForm vehicle={selectedVehicle} onSave={handleModalClose} />
        </ModalForm>
      </div>
    </AdminLayout>
  )
}

export default VehiclesPage
