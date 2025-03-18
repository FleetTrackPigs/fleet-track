import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase';
import { UserRole } from '../types/auth';

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        name: string;
        lastName?: string;
        username: string;
        role: UserRole;
        status: 'active' | 'inactive';
      };
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
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Unauthorized: Missing or invalid token' });
    }

    const token = authHeader.split(' ')[1];
    
    // Verify token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return res.status(401).json({ message: 'Unauthorized: Invalid token' });
    }

    // Get user details from database
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (userError || !userData) {
      return res.status(401).json({ message: 'Unauthorized: User not found' });
    }

    // Check if user is active
    if (userData.status !== 'active') {
      return res.status(403).json({ message: 'Forbidden: User account is inactive' });
    }

    // Attach user to request
    req.user = userData;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({ message: 'Internal server error during authentication' });
  }
};

// Middleware to check user role
export const checkRole = (requiredRole: UserRole) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized: User not authenticated' });
    }

    if (req.user.role !== requiredRole) {
      return res.status(403).json({ message: `Forbidden: ${requiredRole} role required` });
    }

    next();
  };
}; 
