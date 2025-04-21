import express from 'express'
import {
  getAllScheduledMaintenance,
  getScheduledMaintenanceById,
  createMaintenanceSchedule,
  updateMaintenanceSchedule,
  deleteMaintenanceSchedule
} from '../controllers/maintenanceController'
import { authenticate, checkRole } from '../middleware/auth'
import { body, param } from 'express-validator'

const router = express.Router()

// Apply authentication middleware to all maintenance routes
router.use(authenticate)

// Get all scheduled maintenance
router.get('/', getAllScheduledMaintenance)

// Get scheduled maintenance by ID
router.get(
  '/:id',
  [
    param('id')
      .isUUID()
      .withMessage('Valid maintenance schedule ID is required')
  ],
  getScheduledMaintenanceById
)

// Create a new maintenance schedule
router.post(
  '/',
  [
    body('vehicle_id').isUUID().withMessage('Valid vehicle ID is required'),
    body('scheduled_date').isISO8601().withMessage('Valid date is required'),
    body('maintenance_type')
      .isString()
      .withMessage('Maintenance type is required'),
    body('description').optional().isString(),
    body('status')
      .optional()
      .isIn(['pending', 'completed', 'cancelled'])
      .withMessage('Status must be one of: pending, completed, cancelled'),
    body('markAsMaintenanceNow').optional().isBoolean()
  ],
  createMaintenanceSchedule
)

// Update maintenance schedule
router.put(
  '/:id',
  [
    param('id')
      .isUUID()
      .withMessage('Valid maintenance schedule ID is required'),
    body('scheduled_date')
      .optional()
      .isISO8601()
      .withMessage('Valid date is required'),
    body('maintenance_type').optional().isString(),
    body('description').optional().isString(),
    body('status')
      .optional()
      .isIn(['pending', 'completed', 'cancelled'])
      .withMessage('Status must be one of: pending, completed, cancelled')
  ],
  updateMaintenanceSchedule
)

// Delete maintenance schedule
router.delete(
  '/:id',
  [
    param('id')
      .isUUID()
      .withMessage('Valid maintenance schedule ID is required')
  ],
  deleteMaintenanceSchedule
)

export default router
