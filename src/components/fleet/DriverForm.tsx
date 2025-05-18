import { useState, useEffect } from 'react'
import { useFleet } from '@/contexts/FleetContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Driver } from '@/types/fleet'
import { authApi } from '@/services/api'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/components/ui/use-toast'

interface DriverFormProps {
  driver?: Driver
  onSave: () => void
}

export function DriverForm({ driver, onSave }: DriverFormProps) {
  const { addDriver, updateDriver } = useFleet()
  const { token } = useAuth()
  const { toast } = useToast()
  const isEditing = !!driver
  const [availableUsers, setAvailableUsers] = useState<
    Array<{ id: string; username: string; email: string }>
  >([])
  const [isLoadingUsers, setIsLoadingUsers] = useState(false)

  const [formData, setFormData] = useState({
    userId: driver?.userid || '',
    name: driver?.name || '',
    lastname: driver?.lastname || '',
    phone: driver?.phone || '',
    license_type: driver?.license_type || '',
    license_expiry: driver?.license_expiry || '',
    status: driver?.status || 'active'
  })

  const [errors, setErrors] = useState({
    userId: '',
    name: '',
    lastname: ''
  })

  // Load available users with driver role who don't already have a driver profile
  useEffect(() => {
    const fetchUsers = async () => {
      if (!isEditing && token) {
        setIsLoadingUsers(true)
        try {
          const response = await authApi.getDriverUsers(token)
          if (response.data?.data) {
            setAvailableUsers(
              response.data.data as Array<{
                id: string
                username: string
                email: string
              }>
            )
          } else if (response.error) {
            toast({
              title: 'Error',
              description: 'No se pudieron cargar los usuarios disponibles',
              variant: 'destructive'
            })
          }
        } catch (error) {
          console.error('Error loading available users:', error)
          toast({
            title: 'Error',
            description: 'No se pudieron cargar los usuarios disponibles',
            variant: 'destructive'
          })
        } finally {
          setIsLoadingUsers(false)
        }
      }
    }

    fetchUsers()
    // Only run this once when the component mounts or when isEditing changes
  }, [isEditing, token, toast])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))

    // Clear error when field is edited
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleStatusChange = (value: string) => {
    setFormData(prev => ({ ...prev, status: value as 'active' | 'inactive' }))
  }

  const handleUserChange = (value: string) => {
    setFormData(prev => ({ ...prev, userId: value }))

    // Find selected user to auto-fill name and lastname if available
    const selectedUser = availableUsers.find(user => user.id === value)
    if (selectedUser) {
      const nameParts = selectedUser.username.split('.')
      if (nameParts.length > 1) {
        // Assuming username format is "firstname.lastname"
        setFormData(prev => ({
          ...prev,
          userId: value,
          name: nameParts[0].charAt(0).toUpperCase() + nameParts[0].slice(1),
          lastname: nameParts[1].charAt(0).toUpperCase() + nameParts[1].slice(1)
        }))
      }
    }

    // Clear error
    setErrors(prev => ({ ...prev, userId: '' }))
  }

  const validateForm = () => {
    const newErrors = {
      userId: formData.userId ? '' : 'Debe seleccionar un usuario',
      name: formData.name ? '' : 'El nombre es obligatorio',
      lastname: formData.lastname ? '' : 'Los apellidos son obligatorios'
    }

    setErrors(newErrors)
    return !Object.values(newErrors).some(error => error)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    if (isEditing && driver) {
      // Only update driver details
      const { userId, ...updateData } = formData
      updateDriver(driver.id, {
        ...updateData,
        // Convert lastname to lastName for API
        lastName: formData.lastname
      })
    } else {
      // Create new driver with user association
      addDriver({
        userId: formData.userId,
        name: formData.name,
        lastName: formData.lastname, // Convert lowercase to uppercase for API
        phone: formData.phone,
        license_type: formData.license_type,
        license_expiry: formData.license_expiry,
        status: formData.status
      })
    }

    onSave()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {!isEditing && (
        <div className="space-y-2">
          <Label htmlFor="userId">Usuario</Label>
          <Select
            value={formData.userId}
            onValueChange={handleUserChange}
            disabled={isLoadingUsers || isEditing}
          >
            <SelectTrigger>
              <SelectValue
                placeholder={
                  isLoadingUsers
                    ? 'Cargando usuarios...'
                    : 'Selecciona un usuario'
                }
              />
            </SelectTrigger>
            <SelectContent>
              {availableUsers.map(user => (
                <SelectItem key={user.id} value={user.id}>
                  {user.username} ({user.email})
                </SelectItem>
              ))}
              {availableUsers.length === 0 && !isLoadingUsers && (
                <SelectItem value="none" disabled>
                  No hay usuarios disponibles
                </SelectItem>
              )}
            </SelectContent>
          </Select>
          {errors.userId && (
            <p className="text-xs text-red-500">{errors.userId}</p>
          )}
        </div>
      )}

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
          <Label htmlFor="lastname">Apellidos</Label>
          <Input
            id="lastname"
            name="lastname"
            placeholder="Ej: Pérez"
            value={formData.lastname}
            onChange={handleChange}
          />
          {errors.lastname && (
            <p className="text-xs text-red-500">{errors.lastname}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="phone">Teléfono</Label>
          <Input
            id="phone"
            name="phone"
            placeholder="Ej: +34612345678"
            value={formData.phone}
            onChange={handleChange}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="license_type">Tipo de Licencia</Label>
          <Input
            id="license_type"
            name="license_type"
            placeholder="Ej: B, C, D..."
            value={formData.license_type}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="license_expiry">Fecha de Caducidad</Label>
          <Input
            id="license_expiry"
            name="license_expiry"
            type="date"
            value={formData.license_expiry}
            onChange={handleChange}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Estado</Label>
          <Select value={formData.status} onValueChange={handleStatusChange}>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona un estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Activo</SelectItem>
              <SelectItem value="inactive">Inactivo</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onSave}>
          Cancelar
        </Button>
        <Button type="submit">
          {isEditing ? 'Actualizar' : 'Añadir'} Conductor
        </Button>
      </div>
    </form>
  )
}
