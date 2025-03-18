
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types/auth';

interface AuthLayoutProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
}

const AuthLayout = ({ children, requiredRole }: AuthLayoutProps) => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (requiredRole && user?.role !== requiredRole) {
      if (user?.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (user?.role === 'driver') {
        navigate('/driver/dashboard');
      } else {
        navigate('/login');
      }
    }
  }, [isAuthenticated, navigate, user, requiredRole]);

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
};

export default AuthLayout;
