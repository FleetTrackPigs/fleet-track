
import { createContext, useContext, useState, ReactNode } from 'react';
import { AuthContextType, User, UserRole } from '@/types/auth';

// Datos de prueba para simular la autenticación
const MOCK_USERS = [
  {
    id: '1',
    name: 'Carlos',
    lastName: 'Rodríguez',
    username: 'admin',
    password: 'admin',
    role: 'admin' as UserRole,
    status: 'active' as const
  },
  {
    id: '2',
    name: 'Juan',
    lastName: 'Pérez',
    username: 'driver',
    password: 'driver',
    role: 'driver' as UserRole,
    status: 'active' as const
  }
];

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem('flotaUser');
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const login = async (username: string, password: string): Promise<boolean> => {
    // Simulando una verificación de credenciales
    const foundUser = MOCK_USERS.find(
      u => u.username === username && u.password === password
    );

    if (foundUser) {
      // Excluimos la contraseña antes de almacenar
      const { password: _, ...userWithoutPassword } = foundUser;
      setUser(userWithoutPassword);
      localStorage.setItem('flotaUser', JSON.stringify(userWithoutPassword));
      return true;
    }

    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('flotaUser');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
