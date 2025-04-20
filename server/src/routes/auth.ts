import express from 'express'
import {
  login,
  logout,
  getCurrentUser,
  register,
  getDriverUsers
} from '../controllers/authController'
import { authenticate } from '../middleware/auth'
import { body } from 'express-validator'

const router = express.Router()

// Login endpoint
router.post(
  '/login',
  [
    body('username').notEmpty().withMessage('Username is required'),
    body('password').notEmpty().withMessage('Password is required')
  ],
  login
)

// Register endpoint
router.post(
  '/register',
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('username').notEmpty().withMessage('Username is required'),
    body('password')
      .notEmpty()
      .withMessage('Password is required')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters'),
    body('role')
      .optional()
      .isIn(['admin', 'driver'])
      .withMessage('Role must be admin or driver')
  ],
  register
)

// Logout endpoint
router.post('/logout', logout)

// Get current user endpoint (protected)
router.get('/me', authenticate, getCurrentUser)

// Get users with driver role who don't have a driver profile yet (protected)
router.get('/driver-users', authenticate, getDriverUsers)

export { router as authRouter }
