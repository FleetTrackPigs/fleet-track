import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import Logo from '@/components/Logo'
import {
  Users,
  Truck,
  ArrowRightLeft,
  LogOut,
  Map,
  UserCog,
  Package
} from 'lucide-react'
import { Button } from '@/components/ui/button'

interface AdminSidebarProps {
  closeSidebar?: () => void
}

const AdminSidebar = ({ closeSidebar }: AdminSidebarProps) => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
    if (closeSidebar) closeSidebar()
  }

  const handleNavigation = (path: string) => {
    navigate(path)
    if (closeSidebar) closeSidebar()
  }

  return (
    <div className="flex h-full w-64 flex-col bg-flota-blue text-white overflow-hidden">
      <div className="flex h-16 items-center px-4 sm:px-6">
        <Logo color="text-white" />
      </div>

      <div className="flex flex-col gap-1 px-2 sm:px-3 py-2">
        <div className="mb-2 px-3 py-3 border-b border-white/10">
          <p className="text-sm font-medium text-white">
            Bienvenido, {user?.name}
          </p>
          <p className="text-xs text-white/70">Administrador</p>
        </div>

        <Button
          variant="ghost"
          className="justify-start gap-3 text-white hover:bg-flota-darkblue"
          onClick={() => handleNavigation('/admin/dashboard')}
        >
          <ArrowRightLeft size={18} />
          <span>Dashboard</span>
        </Button>

        <Button
          variant="ghost"
          className="justify-start gap-3 text-white hover:bg-flota-darkblue"
          onClick={() => handleNavigation('/admin/drivers')}
        >
          <Users size={18} />
          <span>Conductores</span>
        </Button>

        <Button
          variant="ghost"
          className="justify-start gap-3 text-white hover:bg-flota-darkblue"
          onClick={() => handleNavigation('/admin/vehicles')}
        >
          <Truck size={18} />
          <span>Vehículos</span>
        </Button>

        <Button
          variant="ghost"
          className="justify-start gap-3 text-white hover:bg-flota-darkblue"
          onClick={() => handleNavigation('/admin/services')}
        >
          <Package size={18} />
          <span>Servicios</span>
        </Button>

        {/* <Button
          variant="ghost"
          className="justify-start gap-3 text-white hover:bg-flota-darkblue"
          onClick={() => handleNavigation('/admin/assign')}
        >
          <ArrowRightLeft size={18} />
          <span>Asignaciones</span>
        </Button> */}

        <Button
          variant="ghost"
          className="justify-start gap-3 text-white hover:bg-flota-darkblue"
          onClick={() => handleNavigation('/admin/map')}
        >
          <Map size={18} />
          <span>Mapa</span>
        </Button>
      </div>

      <div className="mt-auto px-3 py-2 border-t border-white/10">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-white hover:bg-flota-darkblue"
          onClick={() => handleNavigation('/profile')}
        >
          <UserCog size={18} />
          <span>Mi Perfil</span>
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-white hover:bg-flota-darkblue"
          onClick={handleLogout}
        >
          <LogOut size={18} />
          <span>Salir</span>
        </Button>
      </div>
    </div>
  )
}

export default AdminSidebar
