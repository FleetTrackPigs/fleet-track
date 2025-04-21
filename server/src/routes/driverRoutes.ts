import express from 'express'
import {
  getAllDrivers,
  getDriverById,
  createDriver,
  updateDriver,
  deleteDriver
} from '../controllers/driverController'
import { authenticate, checkRole } from '../middleware/auth'
import { body, param } from 'express-validator'

const router = express.Router()

// Apply authentication middleware to all driver routes
router.use(authenticate)

// GET /drivers - Get all drivers
router.get('/', getAllDrivers)

// GET /drivers/:id - Get driver by ID
router.get(
  '/:id',
  [param('id').isUUID().withMessage('Valid driver ID is required')],
  getDriverById
)

// POST /drivers - Create a new driver (admin only)
router.post(
  '/',
  [
    checkRole('admin'),
    body('userId').notEmpty().withMessage('User ID is required'),
    body('name').notEmpty().withMessage('Name is required'),
    body('lastName').notEmpty().withMessage('Last name is required')
  ],
  createDriver
)

// PUT /drivers/:id - Update a driver (admin only)
router.put(
  '/:id',
  [
    checkRole('admin'),
    param('id').isUUID().withMessage('Valid driver ID is required')
  ],
  updateDriver
)

// DELETE /drivers/:id - Delete a driver (admin only)
router.delete(
  '/:id',
  [
    checkRole('admin'),
    param('id').isUUID().withMessage('Valid driver ID is required')
  ],
  deleteDriver
)

export { router as driverRouter }
