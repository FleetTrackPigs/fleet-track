import express from 'express'
import {
  getAllVehicleReviews,
  getVehicleReviewById,
  createVehicleReview,
  getVehiclesRequiringMaintenance,
  getVehicleReviewsByVehicleId
} from '../controllers/vehicleReviewController'
import { authenticate, checkRole } from '../middleware/auth'
import { body, param } from 'express-validator'

const router = express.Router()

// Apply authentication middleware to all vehicle review routes
router.use(authenticate)

// Get all vehicle reviews
// Admin can see all, drivers can only see their own
router.get('/', getAllVehicleReviews)

// Get vehicles requiring maintenance (admin only)
router.get(
  '/requiring-maintenance',
  checkRole('admin'),
  getVehiclesRequiringMaintenance
)

// Get vehicle reviews by vehicle ID
router.get(
  '/vehicle/:id',
  [param('id').isUUID().withMessage('Valid vehicle ID is required')],
  getVehicleReviewsByVehicleId
)

// Get vehicle review by ID
router.get(
  '/:id',
  [param('id').isUUID().withMessage('Valid review ID is required')],
  getVehicleReviewById
)

// Create a new vehicle review
router.post(
  '/',
  [
    body('driver_id').isUUID().withMessage('Valid driver ID is required'),
    body('vehicle_id').isUUID().withMessage('Valid vehicle ID is required'),
    body('lights_working')
      .isBoolean()
      .withMessage('lights_working must be a boolean'),
    body('brakes_working')
      .isBoolean()
      .withMessage('brakes_working must be a boolean'),
    body('tires_condition')
      .isBoolean()
      .withMessage('tires_condition must be a boolean'),
    body('fluids_checked')
      .isBoolean()
      .withMessage('fluids_checked must be a boolean'),
    body('clean_interior')
      .isBoolean()
      .withMessage('clean_interior must be a boolean'),
    body('issues_noted')
      .optional()
      .isString()
      .withMessage('issues_noted must be a string')
  ],
  createVehicleReview
)

export default router
