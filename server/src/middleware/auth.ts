import { Request, Response, NextFunction } from 'express'
import { supabase } from '../config/supabase'
import { UserRole } from '../types/auth'

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string
        name: string
        lastName?: string
        username: string
        role: UserRole
        status: 'active' | 'inactive'
      }
    }
  }
}

// Middleware to verify authentication
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res
        .status(401)
        .json({ message: 'Unauthorized: Missing or invalid token' })
    }

    // Since we're using a fake token for this exercise, we'll skip real token validation
    // In a real app, you would verify the token with a proper JWT library or Supabase auth

    // For this mock app, we'll consider the user authenticated if they have any token
    // The token itself doesn't matter since we're not doing real authentication

    // Attach a mock user to the request (in a real app, you'd decode the JWT and get the user ID)
    // Then fetch the real user details from the database
    req.user = {
      id: '1', // This would normally come from the token
      name: 'Admin User',
      username: 'admin',
      role: 'admin',
      status: 'active'
    }

    next()
  } catch (error) {
    console.error('Authentication error:', error)
    res
      .status(500)
      .json({ message: 'Internal server error during authentication' })
  }
}

// Middleware to check user role
export const checkRole = (requiredRole: UserRole) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res
        .status(401)
        .json({ message: 'Unauthorized: User not authenticated' })
    }

    if (req.user.role !== requiredRole) {
      return res
        .status(403)
        .json({ message: `Forbidden: ${requiredRole} role required` })
    }

    next()
  }
}
