export type UserRole = 'admin' | 'driver'

export interface User {
  id: string
  name: string
  lastName?: string
  username: string
  email?: string
  role: UserRole
  status: 'active' | 'inactive'
}

export interface AuthContextType {
  user: User | null
  token: string | null
  login: (username: string, password: string) => Promise<boolean>
  logout: () => void
  isAuthenticated: boolean
}
