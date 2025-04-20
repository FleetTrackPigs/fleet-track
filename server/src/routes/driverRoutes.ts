import { Router } from 'express'
import {
  getAllDrivers,
  getDriverById,
  createDriver,
  updateDriver,
  deleteDriver
} from '../controllers/driverController'

const router = Router()

// GET /drivers - Get all drivers
router.get('/', getAllDrivers)

// GET /drivers/:id - Get driver by ID
router.get('/:id', getDriverById)

// POST /drivers - Create a new driver
router.post('/', createDriver)

// PUT /drivers/:id - Update a driver
router.put('/:id', updateDriver)

// DELETE /drivers/:id - Delete a driver
router.delete('/:id', deleteDriver)

export default router
