
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Logo from '@/components/Logo';
import { Users, Truck, ArrowRightLeft, LogOut, Map } from 'lucide-react';
import { Button } from '@/components/ui/button';

const AdminSidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen w-64 flex-col bg-sidebar fixed left-0 top-0">
      <div className="flex h-16 items-center px-6">
        <Logo />
      </div>
      
      <div className="flex flex-col gap-1 px-3 py-2">
        <div className="mb-2 px-4 py-3">
          <p className="text-sm font-medium text-sidebar-foreground">
            Bienvenido, {user?.name}
          </p>
          <p className="text-xs text-sidebar-foreground/70">Administrador</p>
        </div>

        <Button 
          variant="ghost" 
          className="justify-start gap-3 text-sidebar-foreground" 
          onClick={() => navigate('/admin/dashboard')}
        >
          <ArrowRightLeft size={18} />
          <span>Dashboard</span>
        </Button>

        <Button 
          variant="ghost" 
          className="justify-start gap-3 text-sidebar-foreground" 
          onClick={() => navigate('/admin/drivers')}
        >
          <Users size={18} />
          <span>Conductores</span>
        </Button>
        
        <Button 
          variant="ghost" 
          className="justify-start gap-3 text-sidebar-foreground" 
          onClick={() => navigate('/admin/vehicles')}
        >
          <Truck size={18} />
          <span>Vehículos</span>
        </Button>
        
        <Button 
          variant="ghost" 
          className="justify-start gap-3 text-sidebar-foreground" 
          onClick={() => navigate('/admin/assign')}
        >
          <ArrowRightLeft size={18} />
          <span>Asignaciones</span>
        </Button>
        
        <Button 
          variant="ghost" 
          className="justify-start gap-3 text-sidebar-foreground" 
          onClick={() => navigate('/admin/map')}
        >
          <Map size={18} />
          <span>Mapa</span>
        </Button>
      </div>
      
      <div className="mt-auto px-3 py-2">
        <Button 
          variant="ghost" 
          className="w-full justify-start gap-3 text-sidebar-foreground" 
          onClick={handleLogout}
        >
          <LogOut size={18} />
          <span>Salir</span>
        </Button>
      </div>
    </div>
  );
};

export default AdminSidebar;
