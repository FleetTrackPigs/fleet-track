import { Request, Response } from 'express'
import { supabase } from '../config/supabase'
import { LoginRequest, LoginResponse, RegisterRequest } from '../types/auth'
import logger from '../utils/logger'
import crypto from 'crypto'
import bcrypt from 'bcrypt'

export const login = async (
  req: Request<object, object, LoginRequest>,
  res: Response
) => {
  try {
    const { username, password } = req.body

    // Get user from our users table by username or email
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .or(`username.eq."${username}",email.eq."${username}"`)
      .single()

    if (userError || !userData) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    // Check if user is active
    if (userData.status !== 'active') {
      return res.status(403).json({ message: 'Account is inactive' })
    }

    // Compare hashed password
    const pepper = process.env.PASSWORD_PEPPER || ''
    const passwordMatch = await bcrypt.compare(
      password + pepper,
      userData.password
    )
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    // Create response (in a real app, you would generate a JWT token here)
    const fakeToken = crypto.randomBytes(16).toString('hex')

    const response: LoginResponse = {
      user: {
        id: userData.id,
        name: userData.name,
        lastName: userData.lastName,
        username: userData.username,
        email: userData.email,
        role: userData.role,
        status: userData.status
      },
      token: fakeToken
    }

    res.status(200).json(response)
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ message: 'Internal server error during login' })
  }
}

// Helper function to create error responses
const createErrorResponse = (message: string, details?: any) => {
  const error: any = new Error(message)
  error.statusCode = 400
  error.details = details
  return error
}

export const register = async (
  req: Request<object, object, RegisterRequest>,
  res: Response
) => {
  try {
    const {
      name,
      lastName,
      username,
      email,
      password,
      role = 'driver'
    } = req.body

    // Basic validation
    if (!name || !username || !email || !password) {
      return res.status(400).json({
        message: 'Missing required fields',
        details: {
          required: ['name', 'username', 'email', 'password'],
          received: Object.keys(req.body)
        }
      })
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: 'Password too short',
        details: { minLength: 6 }
      })
    }

    try {
      // Generate a unique ID
      const userId = crypto.randomUUID()

      // Hash password with salt and pepper
      const pepper = process.env.PASSWORD_PEPPER || ''
      const saltRounds = 12
      const hashedPassword = await bcrypt.hash(password + pepper, saltRounds)

      // Log what we're about to insert (never log plaintext password)
      console.log('Inserting user:', {
        id: userId,
        name,
        lastName,
        username,
        email,
        password: '[HASHED]',
        role,
        status: 'active'
      })

      // Insert user directly
      const { error } = await supabase.from('users').insert({
        id: userId,
        name,
        lastName,
        username,
        email,
        password: hashedPassword,
        role,
        status: 'active'
      })

      if (error) {
        console.error('Database error:', error)

        return res.status(400).json({
          message: 'Error creating user',
          details: error
        })
      }

      return res.status(201).json({
        message: 'User created successfully',
        user: {
          id: userId,
          name,
          lastName,
          username,
          email,
          role,
          status: 'active'
        }
      })
    } catch (error) {
      console.error('Error during user creation:', error)

      return res.status(500).json({
        message: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      })
    }
  } catch (error) {
    console.error('Unexpected error:', error)

    return res.status(500).json({
      message: 'Internal server error'
    })
  }
}

export const logout = async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization
    if (authHeader && authHeader.startsWith('Bearer ')) {
      // Extract token
      const token = authHeader.split(' ')[1]

      // Sign out session
      await supabase.auth.signOut()
    }

    res.status(200).json({ message: 'Logged out successfully' })
  } catch (error) {
    console.error('Logout error:', error)
    res.status(500).json({ message: 'Internal server error during logout' })
  }
}

export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    // User should be attached to request from auth middleware
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' })
    }

    res.status(200).json({ user: req.user })
  } catch (error) {
    console.error('Get current user error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// Get users with driver role who don't already have a driver profile
export const getDriverUsers = async (req: Request, res: Response) => {
  try {
    // Get users with driver role
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, username, email')
      .eq('role', 'driver')
      .eq('status', 'active')

    if (usersError) {
      console.error('Error fetching driver users:', usersError)
      return res.status(500).json({
        message: 'Error fetching driver users',
        error: usersError
      })
    }

    if (!users || users.length === 0) {
      return res.status(200).json({
        message: 'No driver users found',
        data: []
      })
    }

    // Get existing driver profiles
    const { data: existingDrivers, error: driversError } = await supabase
      .from('drivers')
      .select('userid')

    if (driversError) {
      console.error('Error fetching existing drivers:', driversError)
      return res.status(500).json({
        message: 'Error fetching existing drivers',
        error: driversError
      })
    }

    // Filter out users who already have a driver profile
    const existingUserIds = existingDrivers?.map(driver => driver.userid) || []
    const availableDriverUsers = users.filter(
      user => !existingUserIds.includes(user.id)
    )

    return res.status(200).json({
      message: 'Available driver users retrieved successfully',
      data: availableDriverUsers
    })
  } catch (error) {
    console.error('Error in getDriverUsers:', error)
    return res.status(500).json({
      message: 'Internal server error',
      error
    })
  }
}
