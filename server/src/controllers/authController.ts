import { Request, Response } from 'express';
import { supabase } from '../config/supabase';
import { LoginRequest, LoginResponse, RegisterRequest } from '../types/auth';

export const login = async (req: Request<{}, {}, LoginRequest>, res: Response) => {
  try {
    const { username, password } = req.body;

    // Authenticate with Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email: username, // Assuming username is email in Supabase
      password
    });

    if (error || !data.user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Get user info from our users table
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (userError || !userData) {
      return res.status(401).json({ message: 'User not found' });
    }

    // Check if user is active
    if (userData.status !== 'active') {
      return res.status(403).json({ message: 'Account is inactive' });
    }

    // Create response
    const response: LoginResponse = {
      user: userData,
      token: data.session.access_token
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error during login' });
  }
};

export const register = async (req: Request<{}, {}, RegisterRequest>, res: Response) => {
  try {
    const { name, lastName, username, password, role = 'driver' } = req.body;

    // Validar campos requeridos
    if (!name || !username || !password) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Verificar si el usuario ya existe
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single();

    if (existingUser) {
      return res.status(409).json({ message: 'Username already exists' });
    }

    // Crear usuario en Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: username, // Usando username como email
      password: password,
    });

    if (authError || !authData.user) {
      return res.status(400).json({ message: 'Error creating user', error: authError });
    }

    // Crear perfil de usuario en nuestra tabla de users
    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert([
        {
          id: authData.user.id,
          name,
          lastName,
          username,
          role,
          status: 'active'
        }
      ])
      .select()
      .single();

    if (userError) {
      // Rollback: Eliminar el usuario de auth si falla la creación del perfil
      await supabase.auth.admin.deleteUser(authData.user.id);
      return res.status(400).json({ message: 'Error creating user profile', error: userError });
    }

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: userData.id,
        name: userData.name,
        lastName: userData.lastName,
        username: userData.username,
        role: userData.role,
        status: userData.status
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Internal server error during registration' });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      // Extract token
      const token = authHeader.split(' ')[1];
      
      // Sign out session
      await supabase.auth.signOut();
    }
    
    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Internal server error during logout' });
  }
};

export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    // User should be attached to request from auth middleware
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    res.status(200).json({ user: req.user });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}; 
