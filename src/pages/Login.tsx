
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Logo from '@/components/Logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Key } from 'lucide-react';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Redirigir a la página correcta si ya está autenticado
  useEffect(() => {
    if (isAuthenticated) {
      if (user?.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (user?.role === 'driver') {
        navigate('/driver/dashboard');
      }
    }
  }, [isAuthenticated, user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !password) {
      setError('Por favor, introduce el usuario y la contraseña');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      const success = await login(username, password);
      
      if (success) {
        // La redirección se maneja en el useEffect
      } else {
        setError('Usuario o contraseña incorrectos');
      }
    } catch (error) {
      setError('Ha ocurrido un error al iniciar sesión');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = async (role: 'admin' | 'driver') => {
    setUsername(role);
    setPassword(role);
    setIsLoading(true);
    
    try {
      const success = await login(role, role);
      if (!success) {
        setError('Error al iniciar sesión rápida');
      }
      // La redirección se maneja en el useEffect
    } catch (error) {
      setError('Ha ocurrido un error al iniciar sesión');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-2 text-center">
          <div className="flex justify-center mb-4">
            <Logo size="lg" color="text-flota-blue" />
          </div>
          <CardTitle className="text-2xl">Iniciar Sesión</CardTitle>
          <CardDescription>
            Introduce tus credenciales para acceder al sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
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
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
      </Card>
    </div>
  );
};

export default Login;
