import { createContext, useContext, useState, ReactNode } from 'react'
import { AuthContextType, User } from '@/types/auth'
import { authApi } from '@/services/api'

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem('flotaUser')
    return storedUser ? JSON.parse(storedUser) : null
  })

  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('flotaToken')
  })

  const login = async (
    username: string,
    password: string
  ): Promise<boolean> => {
    try {
      const { data, error } = await authApi.login(username, password)

      if (error || !data) {
        console.error('Login error:', error)
        return false
      }

      setUser(data.user)
      setToken(data.token)
      localStorage.setItem('flotaUser', JSON.stringify(data.user))
      localStorage.setItem('flotaToken', data.token)
      return true
    } catch (error) {
      console.error('Login error:', error)
      return false
    }
  }

  const logout = () => {
    try {
      authApi.logout()
    } finally {
      setUser(null)
      setToken(null)
      localStorage.removeItem('flotaUser')
      localStorage.removeItem('flotaToken')
    }
  }

  return (
    <AuthContext.Provider
      value={{ user, token, login, logout, isAuthenticated: !!user }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
