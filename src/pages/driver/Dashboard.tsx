import { useAuth } from '@/contexts/AuthContext'
import { useFleet } from '@/contexts/FleetContext'
import DriverLayout from '@/components/layout/DriverLayout'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { VehicleStatusBadge } from '@/components/fleet/VehicleStatusBadge'
import {
  Car,
  Info,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  Wrench,
  Calendar
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
import { toast } from '@/hooks/use-toast'
import { vehicleReviewsApi } from '@/services/api'
import { format } from 'date-fns'

// Add interface for maintenance data
interface MaintenanceInfo {
  id: string
  scheduled_date: string
  maintenance_type: string
  description: string
  status: 'pending' | 'completed' | 'cancelled'
}

const DriverDashboard = () => {
  const { user, token } = useAuth()
  const { getDriverVehicle, drivers, vehicles } = useFleet()

  // State for finding the current driver
  const [currentDriverId, setCurrentDriverId] = useState('')
  const [assignedVehicle, setAssignedVehicle] = useState(null)
  const [maintenanceInfo, setMaintenanceInfo] =
    useState<MaintenanceInfo | null>(null)

  // Find the current driver and their vehicle
  useEffect(() => {
    if (user && drivers.length > 0) {
      // Find the driver by userid or user information
      const driver = drivers.find(
        d =>
          d.userid === user.id ||
          d.user?.id === user.id ||
          d.user?.username === user.username ||
          d.user?.email === user.email
      )

      if (driver) {
        setCurrentDriverId(driver.id)

        // If driver has a vehicle assigned directly
        if (driver.vehicleid) {
          const vehicle = vehicles.find(v => v.id === driver.vehicleid)
          if (vehicle) {
            setAssignedVehicle(vehicle)

            // Check if vehicle is in maintenance
            if (vehicle.status === 'maintenance' && token) {
              // Fetch maintenance info - this would be an actual API call in a real implementation
              // Here we're simulating it with a setTimeout
              setTimeout(() => {
                setMaintenanceInfo({
                  id: 'maint-' + Math.random().toString(36).substr(2, 9),
                  scheduled_date: new Date().toISOString(),
                  maintenance_type: 'regular',
                  description: 'Mantenimiento programado del vehículo',
                  status: 'pending'
                })
              }, 500)
            }
          }
        } else {
          // Try to find a vehicle assigned to this driver
          const vehicle = vehicles.find(
            v =>
              v.status === 'assigned' &&
              (v.driverid === driver.id || v.driver?.id === driver.id)
          )

          if (vehicle) {
            setAssignedVehicle(vehicle)
          }
        }
      }
    }
  }, [user, drivers, vehicles, token])

  // State for vehicle review form
  const [reviewSubmitting, setReviewSubmitting] = useState(false)
  const [reviewCompleted, setReviewCompleted] = useState(false)
  const [review, setReview] = useState({
    lights_working: true,
    brakes_working: true,
    tires_condition: true,
    fluids_checked: true,
    clean_interior: true,
    issues_noted: ''
  })

  // Handle checkbox changes
  const handleCheckboxChange = (name: keyof typeof review) => {
    setReview(prev => ({
      ...prev,
      [name]: !prev[name]
    }))
  }

  // Handle text input changes
  const handleIssuesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setReview(prev => ({
      ...prev,
      issues_noted: e.target.value
    }))
  }

  // Submit vehicle review
  const submitReview = async () => {
    if (!assignedVehicle || !currentDriverId || !token) {
      toast({
        title: 'Error',
        description: 'No tienes un vehículo asignado para revisar.',
        variant: 'destructive'
      })
      return
    }

    try {
      setReviewSubmitting(true)

      // Submit review to API
      await vehicleReviewsApi.create(
        {
          driver_id: currentDriverId,
          vehicle_id: assignedVehicle.id,
          ...review
        },
        token
      )

      setReviewCompleted(true)
      toast({
        title: 'Revisión completada',
        description:
          'La revisión del vehículo ha sido registrada correctamente.',
        variant: 'default'
      })
    } catch (error) {
      console.error('Error submitting vehicle review:', error)
      toast({
        title: 'Error',
        description:
          'Ha ocurrido un error al enviar la revisión. Intenta de nuevo.',
        variant: 'destructive'
      })
    } finally {
      setReviewSubmitting(false)
    }
  }

  // Reset form to submit another review
  const resetReviewForm = () => {
    setReview({
      lights_working: true,
      brakes_working: true,
      tires_condition: true,
      fluids_checked: true,
      clean_interior: true,
      issues_noted: ''
    })
    setReviewCompleted(false)
  }

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
                      <span className="text-sm text-muted-foreground">
                        Matrícula:
                      </span>
                      <span className="text-sm font-medium">
                        {assignedVehicle.plate}
                      </span>
                    </div>
                    <div className="grid grid-cols-2">
                      <span className="text-sm text-muted-foreground">
                        Estado:
                      </span>
                      <VehicleStatusBadge status={assignedVehicle.status} />
                    </div>
                  </div>

                  {/* Display maintenance information if available */}
                  {assignedVehicle.status === 'maintenance' &&
                    maintenanceInfo && (
                      <div className="mt-2 rounded-lg bg-amber-50 p-3 border border-amber-200 space-y-2">
                        <div className="flex items-center gap-2">
                          <Wrench className="h-4 w-4 text-amber-600" />
                          <span className="text-sm font-medium text-amber-800">
                            En mantenimiento
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-amber-600" />
                          <span className="text-sm text-amber-800">
                            Fecha programada:{' '}
                            {format(
                              new Date(maintenanceInfo.scheduled_date),
                              'dd/MM/yyyy'
                            )}
                          </span>
                        </div>
                        <p className="text-xs text-amber-700">
                          {maintenanceInfo.description}
                        </p>
                      </div>
                    )}
                </div>
              ) : (
                <div className="flex items-center gap-2 rounded-lg border border-dashed p-4 text-muted-foreground">
                  <AlertTriangle className="h-5 w-5" />
                  <p>No tienes asignado ningún vehículo actualmente.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Vehicle Review Card */}
          <Card className="md:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">
                Revisión Diaria del Vehículo
              </CardTitle>
              <CardDescription>
                Realiza la revisión diaria de tu vehículo asignado
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!assignedVehicle ? (
                <div className="flex items-center gap-2 rounded-lg border border-dashed p-4 text-muted-foreground">
                  <AlertTriangle className="h-5 w-5" />
                  <p>No tienes asignado ningún vehículo para revisar.</p>
                </div>
              ) : reviewCompleted ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 rounded-lg bg-green-50 p-4 text-green-700 border border-green-200">
                    <CheckCircle2 className="h-5 w-5" />
                    <p>Revisión completada correctamente</p>
                  </div>
                  <Button onClick={resetReviewForm}>
                    Realizar otra revisión
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="lights"
                        checked={review.lights_working}
                        onCheckedChange={() =>
                          handleCheckboxChange('lights_working')
                        }
                      />
                      <label
                        htmlFor="lights"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Luces funcionando correctamente
                      </label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="brakes"
                        checked={review.brakes_working}
                        onCheckedChange={() =>
                          handleCheckboxChange('brakes_working')
                        }
                      />
                      <label
                        htmlFor="brakes"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Frenos funcionando correctamente
                      </label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="tires"
                        checked={review.tires_condition}
                        onCheckedChange={() =>
                          handleCheckboxChange('tires_condition')
                        }
                      />
                      <label
                        htmlFor="tires"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Neumáticos en buen estado
                      </label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="fluids"
                        checked={review.fluids_checked}
                        onCheckedChange={() =>
                          handleCheckboxChange('fluids_checked')
                        }
                      />
                      <label
                        htmlFor="fluids"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Niveles de fluidos verificados (aceite, refrigerante,
                        etc.)
                      </label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="clean"
                        checked={review.clean_interior}
                        onCheckedChange={() =>
                          handleCheckboxChange('clean_interior')
                        }
                      />
                      <label
                        htmlFor="clean"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Interior limpio
                      </label>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="issues" className="text-sm font-medium">
                      Problemas o incidencias detectadas:
                    </label>
                    <Textarea
                      id="issues"
                      placeholder="Describe cualquier problema o incidencia detectada..."
                      value={review.issues_noted}
                      onChange={handleIssuesChange}
                    />
                  </div>

                  {(!review.lights_working ||
                    !review.brakes_working ||
                    !review.tires_condition ||
                    !review.fluids_checked ||
                    !review.clean_interior ||
                    review.issues_noted.trim() !== '') && (
                    <div className="flex items-center gap-2 rounded-lg bg-amber-50 p-4 text-amber-700 border border-amber-200">
                      <ShieldAlert className="h-5 w-5" />
                      <p>
                        Has detectado problemas en el vehículo. Se registrará
                        para mantenimiento.
                      </p>
                    </div>
                  )}

                  <Button
                    onClick={submitReview}
                    disabled={reviewSubmitting}
                    className="w-full"
                  >
                    {reviewSubmitting ? 'Enviando...' : 'Enviar revisión'}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">Incidencias</CardTitle>
              <CardDescription>Revisa las incidencias activas</CardDescription>
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
  )
}

export default DriverDashboard
