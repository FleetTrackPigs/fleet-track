
export type UserRole = 'admin' | 'driver';

export interface User {
  id: string;
  name: string;
  lastName?: string;
  username: string;
  role: UserRole;
  status: 'active' | 'inactive';
}

export interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}
