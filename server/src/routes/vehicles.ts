import express from 'express'
import {
  getAllVehicles,
  getVehicleById,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  updateVehicleStatus
} from '../controllers/vehicleController'
import { authenticate, checkRole } from '../middleware/auth'
import { body, param } from 'express-validator'

const router = express.Router()

// Apply authentication middleware to all vehicle routes
router.use(authenticate)

// Get all vehicles
router.get('/', getAllVehicles)

// Get vehicle by ID
router.get(
  '/:id',
  [param('id').isUUID().withMessage('Valid vehicle ID is required')],
  getVehicleById
)

// Create a new vehicle (admin only)
router.post(
  '/',
  [
    checkRole('admin'),
    body('brand').notEmpty().withMessage('Brand is required'),
    body('model').notEmpty().withMessage('Model is required'),
    body('plate').notEmpty().withMessage('Plate number is required')
  ],
  createVehicle
)

// Update a vehicle (admin only)
router.put(
  '/:id',
  [
    checkRole('admin'),
    param('id').isUUID().withMessage('Valid vehicle ID is required'),
    body('brand').optional().notEmpty().withMessage('Brand cannot be empty'),
    body('model').optional().notEmpty().withMessage('Model cannot be empty'),
    body('plate')
      .optional()
      .notEmpty()
      .withMessage('Plate number cannot be empty')
  ],
  updateVehicle
)

// Update vehicle status (admin only)
router.patch(
  '/:id/status',
  [
    checkRole('admin'),
    param('id').isUUID().withMessage('Valid vehicle ID is required'),
    body('status')
      .isIn(['available', 'assigned', 'maintenance'])
      .withMessage('Invalid status value')
  ],
  updateVehicleStatus
)

// Delete a vehicle (admin only)
router.delete(
  '/:id',
  [
    checkRole('admin'),
    param('id').isUUID().withMessage('Valid vehicle ID is required')
  ],
  deleteVehicle
)

export { router as vehiclesRouter }
