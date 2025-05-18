import express from 'express'
import { body } from 'express-validator'
import {
  getAllServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
  getDriverServices,
  updateServiceStatus
} from '../controllers/serviceController'

export const serviceRouter = express.Router()

// Get all services
serviceRouter.get('/', getAllServices)

// Get service by ID
serviceRouter.get('/:id', getServiceById)

// Get services for a specific driver
serviceRouter.get('/driver/:driverId', getDriverServices)

// Create a new service
serviceRouter.post(
  '/',
  [
    body('name').notEmpty().withMessage('Service name is required'),
    body('start_address').notEmpty().withMessage('Start address is required'),
    body('end_address').notEmpty().withMessage('End address is required'),
    body('start_lat')
      .isNumeric()
      .withMessage('Start latitude must be a number'),
    body('start_lng')
      .isNumeric()
      .withMessage('Start longitude must be a number'),
    body('end_lat').isNumeric().withMessage('End latitude must be a number'),
    body('end_lng').isNumeric().withMessage('End longitude must be a number'),
    body('status')
      .optional()
      .isIn(['pending', 'in-progress', 'completed', 'cancelled'])
      .withMessage('Invalid status')
  ],
  createService
)

// Update a service
serviceRouter.put('/:id', updateService)

// Delete a service
serviceRouter.delete('/:id', deleteService)

// Update service status
serviceRouter.patch(
  '/:id/status',
  [
    body('status')
      .isIn(['pending', 'in-progress', 'completed', 'cancelled'])
      .withMessage('Invalid status')
  ],
  updateServiceStatus
)

export default serviceRouter
