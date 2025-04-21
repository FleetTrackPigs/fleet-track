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
  Calendar,
  PlusCircle,
  Pencil,
  X
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
import { toast } from '@/hooks/use-toast'
import { vehicleReviewsApi, incidentApi } from '@/services/api'
import { format } from 'date-fns'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

// Definir interfaces para la gestión de incidencias
interface Incident {
  id: string
  vehicle_id: string
  driver_id: string
  incident_date: string
  incident_type: 'accident' | 'breakdown' | 'violation' | 'other'
  severity: 'minor' | 'moderate' | 'major' | 'critical'
  description: string
  status: 'reported' | 'investigating' | 'resolved' | 'closed'
  created_at: string
  updated_at: string
  location?: string
}

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

  // Estados para la gestión de incidencias
  const [incidents, setIncidents] = useState<Incident[]>([])
  const [loadingIncidents, setLoadingIncidents] = useState(false)
  const [isIncidentDialogOpen, setIsIncidentDialogOpen] = useState(false)
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false)
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(
    null
  )
  const [newIncident, setNewIncident] = useState({
    incident_type: 'breakdown' as Incident['incident_type'],
    severity: 'minor' as Incident['severity'],
    description: '',
    location: ''
  })
  const [submittingIncident, setSubmittingIncident] = useState(false)

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

            // Cargar incidencias del vehículo asignado
            fetchVehicleIncidents(vehicle.id)
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
            // Cargar incidencias del vehículo asignado
            fetchVehicleIncidents(vehicle.id)
          }
        }
      }
    }
  }, [user, drivers, vehicles, token])

  // Función para cargar las incidencias del vehículo
  const fetchVehicleIncidents = async (vehicleId: string) => {
    if (!token) return

    try {
      setLoadingIncidents(true)
      console.log('Fetching incidents for vehicle:', vehicleId)

      // Call the incident API to get incidents for this vehicle
      const response = await incidentApi.getByVehicleId(vehicleId, token)
      console.log('Incidents response:', response)

      if (response) {
        // For nested response: response.data contains our data array
        // For direct response: response is our data array
        // Handle both cases
        const incidentsData = Array.isArray(response)
          ? response
          : Array.isArray(response.data)
          ? response.data
          : response && typeof response === 'object'
          ? [response]
          : []

        console.log('Processed incidents data:', incidentsData)
        setIncidents(incidentsData as Incident[])
      } else {
        console.log('No incidents data found, setting empty array')
        setIncidents([])
      }
    } catch (error) {
      console.error('Error al cargar incidencias:', error)
      toast({
        title: 'Error',
        description: 'No se pudieron cargar las incidencias del vehículo.',
        variant: 'destructive'
      })
    } finally {
      setLoadingIncidents(false)
    }
  }

  // Función para crear una nueva incidencia
  const createIncident = async () => {
    if (!assignedVehicle || !currentDriverId || !token) {
      toast({
        title: 'Error',
        description:
          'No tienes un vehículo asignado para reportar incidencias.',
        variant: 'destructive'
      })
      return
    }

    try {
      setSubmittingIncident(true)
      console.log(
        'Creating incident with vehicle:',
        assignedVehicle.id,
        'and driver:',
        currentDriverId
      )

      // Create the incident data object
      const incidentData = {
        vehicle_id: assignedVehicle.id,
        driver_id: currentDriverId,
        incident_date: new Date(),
        ...newIncident,
        status: 'reported' // Set default status
      }
      console.log('Incident data to submit:', incidentData)

      // Call the API to create a new incident
      const response = await incidentApi.create(incidentData, token)
      console.log('Create incident response:', response)

      if (response) {
        // Process the response - it could be nested or direct
        const newIncidentData = response.data || response
        console.log('Processed new incident data:', newIncidentData)

        // Add the new incident to the list - force as Incident type
        setIncidents(prev => [newIncidentData as Incident, ...prev])

        // Force close the dialog
        console.log('Closing incident dialog')
        setIsIncidentDialogOpen(false)

        // Reset form
        setNewIncident({
          incident_type: 'breakdown',
          severity: 'minor',
          description: '',
          location: ''
        })

        toast({
          title: 'Incidencia reportada',
          description: 'La incidencia ha sido reportada correctamente.',
          variant: 'default'
        })

        // Refresh incidents list
        if (assignedVehicle) {
          fetchVehicleIncidents(assignedVehicle.id)
        }
      }
    } catch (error) {
      console.error('Error al reportar incidencia:', error)
      toast({
        title: 'Error',
        description: 'No se pudo reportar la incidencia. Intenta de nuevo.',
        variant: 'destructive'
      })
    } finally {
      setSubmittingIncident(false)
    }
  }

  // Función para actualizar una incidencia existente
  const updateIncidentStatus = async (status: Incident['status']) => {
    if (!selectedIncident || !token) return

    try {
      setSubmittingIncident(true)
      console.log(
        'Updating incident status:',
        selectedIncident.id,
        'to',
        status
      )

      // Call the API to update the incident status
      const response = await incidentApi.updateStatus(
        selectedIncident.id,
        { status },
        token
      )
      console.log('Update incident response:', response)

      if (response) {
        // Process the response - it could be nested or direct
        const updatedIncidentData = response.data || response
        console.log('Processed updated incident data:', updatedIncidentData)

        // Update the incident in the list
        setIncidents(prev =>
          prev.map(inc =>
            inc.id === selectedIncident.id
              ? (updatedIncidentData as Incident)
              : inc
          )
        )

        // Force close the dialog
        console.log('Closing update dialog')
        setIsUpdateDialogOpen(false)
        setSelectedIncident(null)

        toast({
          title: 'Incidencia actualizada',
          description: 'La incidencia ha sido actualizada correctamente.',
          variant: 'default'
        })

        // Refresh incidents list if we have a vehicle
        if (assignedVehicle) {
          fetchVehicleIncidents(assignedVehicle.id)
        }
      }
    } catch (error) {
      console.error('Error al actualizar incidencia:', error)
      toast({
        title: 'Error',
        description: 'No se pudo actualizar la incidencia. Intenta de nuevo.',
        variant: 'destructive'
      })
    } finally {
      setSubmittingIncident(false)
    }
  }

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

  // Handle changes in new incident form
  const handleIncidentChange = (
    field: keyof typeof newIncident,
    value: string
  ) => {
    setNewIncident(prev => ({
      ...prev,
      [field]: value
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

  // Función para obtener un color de badge según la severidad
  const getSeverityBadgeVariant = (severity: Incident['severity']) => {
    switch (severity) {
      case 'minor':
        return 'outline'
      case 'moderate':
        return 'secondary'
      case 'major':
        return 'destructive'
      case 'critical':
        return 'destructive'
      default:
        return 'outline'
    }
  }

  // Función para obtener un color de badge según el estado
  const getStatusBadgeVariant = (status: Incident['status']) => {
    switch (status) {
      case 'reported':
        return 'default'
      case 'investigating':
        return 'secondary'
      case 'resolved':
        return 'outline'
      case 'closed':
        return 'outline'
      default:
        return 'default'
    }
  }

  // Función para obtener un texto legible según el tipo de incidente
  const getIncidentTypeText = (type: Incident['incident_type']) => {
    switch (type) {
      case 'accident':
        return 'Accidente'
      case 'breakdown':
        return 'Avería'
      case 'violation':
        return 'Infracción'
      case 'other':
        return 'Otro'
      default:
        return type
    }
  }

  // Función para obtener un texto legible según la severidad
  const getSeverityText = (severity: Incident['severity']) => {
    switch (severity) {
      case 'minor':
        return 'Leve'
      case 'moderate':
        return 'Moderada'
      case 'major':
        return 'Grave'
      case 'critical':
        return 'Crítica'
      default:
        return severity
    }
  }

  // Función para obtener un texto legible según el estado
  const getStatusText = (status: Incident['status']) => {
    switch (status) {
      case 'reported':
        return 'Reportada'
      case 'investigating':
        return 'En investigación'
      case 'resolved':
        return 'Resuelta'
      case 'closed':
        return 'Cerrada'
      default:
        return status
    }
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

          {/* Incidents Card - nueva versión con gestión de incidencias */}
          <Card className="md:col-span-3">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl">Incidencias</CardTitle>
                  <CardDescription>
                    Gestión de incidencias del vehículo
                  </CardDescription>
                </div>

                {assignedVehicle && (
                  <Button
                    onClick={() => setIsIncidentDialogOpen(true)}
                    size="sm"
                    className="flex items-center gap-1"
                  >
                    <PlusCircle className="h-4 w-4" />
                    <span>Nueva incidencia</span>
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {!assignedVehicle ? (
                <div className="flex items-center gap-2 rounded-lg border border-dashed p-4 text-muted-foreground">
                  <AlertTriangle className="h-5 w-5" />
                  <p>
                    No tienes asignado ningún vehículo para gestionar
                    incidencias.
                  </p>
                </div>
              ) : loadingIncidents ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-pulse text-muted-foreground">
                    Cargando incidencias...
                  </div>
                </div>
              ) : incidents.length === 0 ? (
                <div className="flex items-center gap-2 rounded-lg border border-dashed p-4 text-muted-foreground">
                  <Info className="h-5 w-5" />
                  <p>No hay incidencias activas en este momento.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {incidents.map(incident => (
                    <div
                      key={incident.id}
                      className="rounded-lg border p-4 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex flex-col gap-3">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-2">
                            <Badge
                              variant={getSeverityBadgeVariant(
                                incident.severity
                              )}
                            >
                              {getSeverityText(incident.severity)}
                            </Badge>
                            <Badge
                              variant={getStatusBadgeVariant(incident.status)}
                            >
                              {getStatusText(incident.status)}
                            </Badge>
                          </div>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedIncident(incident)
                              setIsUpdateDialogOpen(true)
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </div>

                        <div>
                          <h4 className="font-medium mb-1">
                            {getIncidentTypeText(incident.incident_type)}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {incident.description}
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground">
                          {incident.location && (
                            <div className="flex items-center gap-1">
                              <span>Ubicación:</span>
                              <span>{incident.location}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <span>Fecha:</span>
                            <span>
                              {format(
                                new Date(incident.incident_date),
                                'dd/MM/yyyy HH:mm'
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Dialog para crear nueva incidencia */}
        <Dialog
          open={isIncidentDialogOpen}
          onOpenChange={setIsIncidentDialogOpen}
        >
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Reportar nueva incidencia</DialogTitle>
              <DialogDescription>
                Completa el formulario para reportar una incidencia con tu
                vehículo asignado.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="incident-type">Tipo de incidencia</Label>
                  <Select
                    value={newIncident.incident_type}
                    onValueChange={value =>
                      handleIncidentChange(
                        'incident_type',
                        value as Incident['incident_type']
                      )
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="breakdown">Avería</SelectItem>
                      <SelectItem value="accident">Accidente</SelectItem>
                      <SelectItem value="violation">Infracción</SelectItem>
                      <SelectItem value="other">Otro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="severity">Severidad</Label>
                  <Select
                    value={newIncident.severity}
                    onValueChange={value =>
                      handleIncidentChange(
                        'severity',
                        value as Incident['severity']
                      )
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona severidad" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="minor">Leve</SelectItem>
                      <SelectItem value="moderate">Moderada</SelectItem>
                      <SelectItem value="major">Grave</SelectItem>
                      <SelectItem value="critical">Crítica</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Ubicación</Label>
                <Input
                  id="location"
                  placeholder="Escribe la ubicación donde ocurrió"
                  value={newIncident.location}
                  onChange={e =>
                    handleIncidentChange('location', e.target.value)
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  placeholder="Describe la incidencia en detalle"
                  value={newIncident.description}
                  onChange={e =>
                    handleIncidentChange('description', e.target.value)
                  }
                  rows={4}
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsIncidentDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                onClick={createIncident}
                disabled={submittingIncident || !newIncident.description.trim()}
              >
                {submittingIncident ? 'Enviando...' : 'Reportar incidencia'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog para actualizar una incidencia existente */}
        <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Actualizar incidencia</DialogTitle>
              <DialogDescription>
                Actualiza el estado de la incidencia.
              </DialogDescription>
            </DialogHeader>

            {selectedIncident && (
              <>
                <div className="py-4">
                  <div className="rounded-lg border p-4 mb-4">
                    <h4 className="font-medium mb-1">
                      {getIncidentTypeText(selectedIncident.incident_type)}
                    </h4>
                    <Badge
                      className="mb-2"
                      variant={getSeverityBadgeVariant(
                        selectedIncident.severity
                      )}
                    >
                      {getSeverityText(selectedIncident.severity)}
                    </Badge>
                    <p className="text-sm text-muted-foreground mb-2">
                      {selectedIncident.description}
                    </p>
                    <div className="text-xs text-muted-foreground">
                      Fecha:{' '}
                      {format(
                        new Date(selectedIncident.incident_date),
                        'dd/MM/yyyy HH:mm'
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="status">
                      Estado actual:{' '}
                      <Badge
                        variant={getStatusBadgeVariant(selectedIncident.status)}
                      >
                        {getStatusText(selectedIncident.status)}
                      </Badge>
                    </Label>
                    <Select
                      onValueChange={value =>
                        updateIncidentStatus(value as Incident['status'])
                      }
                      defaultValue={selectedIncident.status}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Cambiar estado" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="reported">Reportada</SelectItem>
                        <SelectItem value="investigating">
                          En investigación
                        </SelectItem>
                        <SelectItem value="resolved">Resuelta</SelectItem>
                        <SelectItem value="closed">Cerrada</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsUpdateDialogOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="button"
                    onClick={() => {
                      // If no update was made via the Select dropdown, just close the dialog
                      setIsUpdateDialogOpen(false)
                    }}
                    disabled={submittingIncident}
                  >
                    Aceptar
                  </Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DriverLayout>
  )
}

export default DriverDashboard
