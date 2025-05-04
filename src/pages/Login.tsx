import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import Logo from '@/components/Logo'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, Key, UserPlus, LogIn, Check } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { authApi } from '@/services/api'
import { useToast } from '@/hooks/use-toast'
import validator from 'validator'

const Login = () => {
  // Login state
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Register state
  const [registerName, setRegisterName] = useState('')
  const [registerLastName, setRegisterLastName] = useState('')
  const [registerUsername, setRegisterUsername] = useState('')
  const [registerEmail, setRegisterEmail] = useState('')
  const [registerPassword, setRegisterPassword] = useState('')
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState('')
  const [registerError, setRegisterError] = useState('')
  const [isRegistering, setIsRegistering] = useState(false)

  const { login, user, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const { toast } = useToast()

  // Redirigir a la página correcta si ya está autenticado
  useEffect(() => {
    if (isAuthenticated) {
      if (user?.role === 'admin') {
        navigate('/admin/dashboard')
      } else if (user?.role === 'driver') {
        navigate('/driver/dashboard')
      }
    }
  }, [isAuthenticated, user, navigate])

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!username || !password) {
      setError('Por favor, introduce el usuario y la contraseña')
      return
    }

    setError('')
    setIsLoading(true)

    try {
      const success = await login(username, password)

      if (success) {
        // La redirección se maneja en el useEffect
      } else {
        setError('Usuario o contraseña incorrectos')
      }
    } catch (error) {
      setError('Ha ocurrido un error al iniciar sesión')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validaciones
    if (
      !registerName ||
      !registerUsername ||
      !registerEmail ||
      !registerPassword
    ) {
      setRegisterError('Por favor, completa los campos requeridos')
      return
    }

    if (registerPassword !== registerConfirmPassword) {
      setRegisterError('Las contraseñas no coinciden')
      return
    }

    if (registerPassword.length < 6) {
      setRegisterError('La contraseña debe tener al menos 6 caracteres')
      return
    }

    // Validar formato de email
    if (!validator.isEmail(registerEmail)) {
      setRegisterError('Por favor, introduce un email válido')
      return
    }

    setRegisterError('')
    setIsRegistering(true)

    try {
      const { data, error } = await authApi.register({
        name: registerName,
        lastName: registerLastName,
        username: registerUsername,
        email: registerEmail,
        password: registerPassword,
        role: 'driver' // Por defecto, los nuevos usuarios son conductores
      })

      if (error) {
        setRegisterError(error)
        return
      }

      // Registro exitoso - mostrar toast y preparar login
      toast({
        title: '¡Registro exitoso!',
        description: (
          <div className="flex items-center">
            <Check className="h-4 w-4 text-green-500 mr-2" />
            <span>Tu cuenta ha sido creada correctamente</span>
          </div>
        ),
        variant: 'default',
        duration: 3000
      })

      // Set login credentials
      setUsername(registerUsername)
      setPassword(registerPassword)

      // Reset form
      setRegisterName('')
      setRegisterLastName('')
      setRegisterUsername('')
      setRegisterEmail('')
      setRegisterPassword('')
      setRegisterConfirmPassword('')

      // Switch to login tab and attempt auto-login
      document.getElementById('login-tab')?.click()

      // Auto-login after a short delay
      setTimeout(async () => {
        try {
          const success = await login(registerUsername, registerPassword)

          if (success) {
            toast({
              title: 'Inicio de sesión automático',
              description: 'Has iniciado sesión correctamente',
              variant: 'default',
              duration: 2000
            })
          }
        } catch (loginError) {
          console.error('Auto-login failed:', loginError)
        }
      }, 500)
    } catch (error) {
      setRegisterError('Ha ocurrido un error al registrar el usuario')
      console.error(error)
    } finally {
      setIsRegistering(false)
    }
  }

  const handleQuickLogin = async (role: 'admin' | 'driver') => {
    setUsername(role)
    setPassword('password')
    setIsLoading(true)

    try {
      const success = await login(role, role)
      if (!success) {
        setError('Error al iniciar sesión rápida')
      }
      // La redirección se maneja en el useEffect
    } catch (error) {
      setError('Ha ocurrido un error al iniciar sesión')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-muted flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-2 text-center">
          <div className="flex justify-center mb-4">
            <Logo size="lg" color="text-flota-blue" />
          </div>
          {/* <CardTitle className="text-2xl">Fleet Track</CardTitle> */}
          <CardDescription>
            Sistema de gestión de flota de vehículos
          </CardDescription>
        </CardHeader>

        <Tabs defaultValue="login">
          <div className="px-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger id="login-tab" value="login">
                Iniciar Sesión
              </TabsTrigger>
              <TabsTrigger value="register">Registrarse</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="login">
            <CardContent className="pt-4">
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="username">Usuario</Label>
                  <Input
                    id="username"
                    placeholder="Usuario"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Contraseña</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Contraseña"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                  />
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                </Button>
              </form>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <div className="text-center text-sm text-muted-foreground w-full">
                <p>O inicia sesión rápidamente como:</p>
              </div>
              <div className="flex gap-2 w-full">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => handleQuickLogin('admin')}
                  disabled={isLoading}
                >
                  <Key className="mr-2 h-4 w-4" />
                  Administrador
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => handleQuickLogin('driver')}
                  disabled={isLoading}
                >
                  <Key className="mr-2 h-4 w-4" />
                  Conductor
                </Button>
              </div>
            </CardFooter>
          </TabsContent>

          <TabsContent value="register">
            <CardContent className="pt-4">
              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                {registerError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{registerError}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="registerName">
                    Nombre <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="registerName"
                    placeholder="Nombre"
                    value={registerName}
                    onChange={e => setRegisterName(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="registerLastName">Apellido</Label>
                  <Input
                    id="registerLastName"
                    placeholder="Apellido"
                    value={registerLastName}
                    onChange={e => setRegisterLastName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="registerUsername">
                    Nombre de usuario <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="registerUsername"
                    placeholder="Nombre de usuario"
                    value={registerUsername}
                    onChange={e => setRegisterUsername(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="registerEmail">
                    Email <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="registerEmail"
                    type="email"
                    placeholder="correo@ejemplo.com"
                    value={registerEmail}
                    onChange={e => setRegisterEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="registerPassword">
                    Contraseña <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="registerPassword"
                    type="password"
                    placeholder="Contraseña"
                    value={registerPassword}
                    onChange={e => setRegisterPassword(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="registerConfirmPassword">
                    Confirmar Contraseña <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="registerConfirmPassword"
                    type="password"
                    placeholder="Confirmar Contraseña"
                    value={registerConfirmPassword}
                    onChange={e => setRegisterConfirmPassword(e.target.value)}
                    required
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isRegistering}
                >
                  {isRegistering ? 'Registrando...' : 'Registrarse'}
                </Button>
              </form>
            </CardContent>
            <CardFooter>
              <div className="text-center text-sm text-muted-foreground w-full">
                <p>
                  Al registrarte, aceptas los términos y condiciones del
                  servicio.
                </p>
              </div>
            </CardFooter>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  )
}

export default Login
