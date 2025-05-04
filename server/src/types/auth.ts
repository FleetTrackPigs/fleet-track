export type UserRole = 'admin' | 'driver'

export interface User {
  id: string
  name: string
  lastName?: string
  username: string
  email: string
  password?: string // Made optional for API responses
  role: UserRole
  status: 'active' | 'inactive'
}

export interface LoginRequest {
  username: string
  password: string
}

export interface LoginResponse {
  user: User
  token: string
}

export interface RegisterRequest {
  name: string
  lastName?: string
  username: string
  email: string
  password: string
  role?: UserRole
}
