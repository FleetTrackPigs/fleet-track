import { useState } from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { authApi } from '@/services/api'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/components/ui/use-toast'
import { KeyRound, Loader2 } from 'lucide-react'
import { z } from 'zod'

interface PasswordResetModalProps {
  isOpen: boolean
  onClose: () => void
  userId: string
  userName: string
  onSuccess?: () => void
}

// Password validation schema
const passwordSchema = z
  .string()
  .min(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  .max(50, { message: 'La contraseña no debe exceder 50 caracteres' })

export function PasswordResetModal({
  isOpen,
  onClose,
  userId,
  userName,
  onSuccess
}: PasswordResetModalProps) {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { token } = useAuth()
  const { toast } = useToast()

  const resetForm = () => {
    setPassword('')
    setConfirmPassword('')
    setError(null)
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const validateForm = (): boolean => {
    // Reset previous errors
    setError(null)

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

  const handleSubmit = async () => {
    if (!validateForm()) return

    setIsLoading(true)
    try {
      if (!token) {
        throw new Error('No estás autenticado')
      }

      const { data, error } = await authApi.resetPassword(
        userId,
        password,
        token
      )

      if (error) {
        throw new Error(error)
      }

      toast({
        title: 'Contraseña restablecida',
        description: `La contraseña de ${userName} ha sido actualizada correctamente.`,
        variant: 'default'
      })

      if (onSuccess) {
        onSuccess()
      }

      handleClose()
    } catch (err: any) {
      console.error('Error resetting password:', err)
      setError(err.message || 'Error al restablecer la contraseña')
      toast({
        title: 'Error',
        description: err.message || 'No se pudo restablecer la contraseña',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <AlertDialog open={isOpen} onOpenChange={handleClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Restablecer contraseña</AlertDialogTitle>
          <AlertDialogDescription>
            Establece una nueva contraseña para el usuario{' '}
            <strong>{userName}</strong>.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="password">Nueva contraseña</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Ingresa la nueva contraseña"
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
              placeholder="Confirma la nueva contraseña"
              disabled={isLoading}
            />
          </div>

          {error && (
            <div className="text-sm font-medium text-destructive">{error}</div>
          )}
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancelar</AlertDialogCancel>
          <Button
            onClick={handleSubmit}
            disabled={isLoading}
            className="bg-flota-blue hover:bg-flota-blue/90"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Procesando...
              </>
            ) : (
              <>
                <KeyRound className="mr-2 h-4 w-4" />
                Restablecer contraseña
              </>
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
