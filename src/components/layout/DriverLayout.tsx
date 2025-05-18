import { ReactNode } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import Logo from '@/components/Logo'
import { Car, LogOut, UserCog, Package } from 'lucide-react'
import { Button } from '@/components/ui/button'
import AuthLayout from './AuthLayout'

interface DriverLayoutProps {
  children: ReactNode
}

const DriverLayout = ({ children }: DriverLayoutProps) => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const handleNavigateToProfile = () => {
    navigate('/profile')
  }

  const isActive = (path: string) => {
    return location.pathname === path
  }

  return (
    <AuthLayout requiredRole="driver">
      <div className="flex min-h-screen flex-col">
        <header className="border-b bg-flota-blue text-white">
          <div className="container mx-auto flex h-16 items-center justify-between px-4">
            <div className="flex items-center">
              <Logo />
              <nav className="ml-8 hidden md:block">
                <ul className="flex space-x-2">
                  <li>
                    <Button
                      variant={
                        isActive('/driver/dashboard') ? 'secondary' : 'ghost'
                      }
                      onClick={() => navigate('/driver/dashboard')}
                      className=" hover:bg-flota-darkblue"
                    >
                      <Car className="mr-2 h-4 w-4" />
                      Dashboard
                    </Button>
                  </li>
                  <li>
                    <Button
                      variant={
                        isActive('/driver/services') ? 'secondary' : 'ghost'
                      }
                      onClick={() => navigate('/driver/services')}
                      className=" hover:bg-flota-darkblue"
                    >
                      <Package className="mr-2 h-4 w-4" />
                      Servicios
                    </Button>
                  </li>
                </ul>
              </nav>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm hidden sm:inline">
                {user?.name} {user?.lastName}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleNavigateToProfile}
                className="text-white hover:bg-flota-darkblue"
              >
                <UserCog className="mr-2 h-4 w-4" />
                Mi Perfil
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-white hover:bg-flota-darkblue"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Salir
              </Button>
            </div>
          </div>
          <div className="md:hidden border-t border-flota-darkblue">
            <div className="container mx-auto px-4 py-2">
              <div className="flex justify-center space-x-2">
                <Button
                  variant={
                    isActive('/driver/dashboard') ? 'secondary' : 'ghost'
                  }
                  size="sm"
                  onClick={() => navigate('/driver/dashboard')}
                  className="text-white hover:bg-flota-darkblue"
                >
                  <Car className="mr-2 h-4 w-4" />
                  Dashboard
                </Button>
                <Button
                  variant={isActive('/driver/services') ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => navigate('/driver/services')}
                  className="text-white hover:bg-flota-darkblue"
                >
                  <Package className="mr-2 h-4 w-4" />
                  Servicios
                </Button>
              </div>
            </div>
          </div>
        </header>
        <main className="container mx-auto flex-1 px-4 py-6">{children}</main>
      </div>
    </AuthLayout>
  )
}

export default DriverLayout
