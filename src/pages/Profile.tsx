import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { z } from 'zod'
import { authApi } from '@/services/api'
import { useToast } from '@/components/ui/use-toast'
import { KeyRound, Loader2, User } from 'lucide-react'
import AdminLayout from '@/components/layout/AdminLayout'
import DriverLayout from '@/components/layout/DriverLayout'

// Password validation schema
const passwordSchema = z
  .string()
  .min(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  .max(50, { message: 'La contraseña no debe exceder 50 caracteres' })

const ProfilePage = () => {
  const { user, token } = useAuth()
  const { toast } = useToast()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  if (!user) {
    return null // Or a redirect to login
  }

  const validatePasswords = (): boolean => {
    // Reset previous errors and success
    setError(null)
    setIsSuccess(false)

    try {
      // Validate password
      passwordSchema.parse(password)

      // Check if passwords match
      if (password !== confirmPassword) {
        setError('Las contraseñas no coinciden')
        return false
      }

      return true
    } catch (err) {
      if (err instanceof z.ZodError) {
        setError(err.errors[0].message)
      } else {
        setError('Error al validar el formulario')
      }
      return false
    }
  }

  const handlePasswordReset = async () => {
    if (!validatePasswords()) return

    setIsLoading(true)
    try {
      if (!token) {
        throw new Error('No estás autenticado')
      }

      const { data, error } = await authApi.resetPassword(
        user.id,
        password,
        token
      )

      if (error) {
        throw new Error(error)
      }

      setIsSuccess(true)
      setPassword('')
      setConfirmPassword('')

      toast({
        title: 'Contraseña actualizada',
        description: 'Tu contraseña ha sido actualizada correctamente.',
        variant: 'default'
      })
    } catch (err: any) {
      console.error('Error updating password:', err)
      setError(err.message || 'Error al actualizar la contraseña')
      toast({
        title: 'Error',
        description: err.message || 'No se pudo actualizar la contraseña',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const LayoutComponent = user.role === 'admin' ? AdminLayout : DriverLayout

  return (
    <LayoutComponent>
      <div className="container py-6">
        <h2 className="text-3xl font-bold tracking-tight mb-6">Mi Perfil</h2>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Información de Usuario</CardTitle>
              <CardDescription>
                Información básica de tu cuenta.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="bg-muted h-16 w-16 rounded-full flex items-center justify-center">
                    <User className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium text-lg">
                      {user.name} {user.lastName}
                    </p>
                    <p className="text-muted-foreground">{user.username}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Email:</span>
                    <span>{user.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Rol:</span>
                    <span className="capitalize">{user.role}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Estado:</span>
                    <span className="capitalize">{user.status}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Cambiar Contraseña</CardTitle>
              <CardDescription>
                Actualiza tu contraseña de acceso.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Nueva contraseña</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Ingresa tu nueva contraseña"
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="Confirma tu nueva contraseña"
                    disabled={isLoading}
                  />
                </div>

                {error && (
                  <div className="text-sm font-medium text-destructive">
                    {error}
                  </div>
                )}

                {isSuccess && (
                  <div className="text-sm font-medium text-green-600">
                    Contraseña actualizada correctamente
                  </div>
                )}

                <Button
                  onClick={handlePasswordReset}
                  disabled={isLoading || !password || !confirmPassword}
                  className="w-full"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Actualizando...
                    </>
                  ) : (
                    <>
                      <KeyRound className="mr-2 h-4 w-4" />
                      Cambiar Contraseña
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </LayoutComponent>
  )
}

export default ProfilePage
