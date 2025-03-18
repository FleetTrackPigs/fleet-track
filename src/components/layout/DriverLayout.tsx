
import { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Logo from '@/components/Logo';
import { Car, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AuthLayout from './AuthLayout';

interface DriverLayoutProps {
  children: ReactNode;
}

const DriverLayout = ({ children }: DriverLayoutProps) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <AuthLayout requiredRole="driver">
      <div className="flex min-h-screen flex-col">
        <header className="border-b bg-flota-blue text-white">
          <div className="container mx-auto flex h-16 items-center justify-between px-4">
            <Logo />
            <div className="flex items-center gap-4">
              <span className="text-sm">
                {user?.name} {user?.lastName}
              </span>
              <Button variant="ghost" size="sm" onClick={handleLogout} className="text-white hover:bg-flota-darkblue">
                <LogOut className="mr-2 h-4 w-4" />
                Salir
              </Button>
            </div>
          </div>
        </header>
        <main className="container mx-auto flex-1 px-4 py-6">
          {children}
        </main>
      </div>
    </AuthLayout>
  );
};

export default DriverLayout;
