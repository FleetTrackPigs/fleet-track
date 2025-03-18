import express from 'express';
import { 
  getAllVehicles, 
  getVehicleById, 
  createVehicle, 
  updateVehicle, 
  deleteVehicle 
} from '../controllers/vehicleController';
import { authenticate, checkRole } from '../middleware/auth';
import { body, param } from 'express-validator';

const router = express.Router();

// Apply authentication middleware to all vehicle routes
router.use(authenticate);

// Get all vehicles
router.get('/', getAllVehicles);

// Get vehicle by ID
router.get('/:id', [
  param('id').isUUID().withMessage('Valid vehicle ID is required')
], getVehicleById);

// Create a new vehicle (admin only)
router.post('/', [
  checkRole('admin'),
  body('brand').notEmpty().withMessage('Brand is required'),
  body('model').notEmpty().withMessage('Model is required'),
  body('plate').notEmpty().withMessage('Plate number is required')
], createVehicle);

// Update a vehicle (admin only)
router.put('/:id', [
  checkRole('admin'),
  param('id').isUUID().withMessage('Valid vehicle ID is required')
], updateVehicle);

// Delete a vehicle (admin only)
router.delete('/:id', [
  checkRole('admin'),
  param('id').isUUID().withMessage('Valid vehicle ID is required')
], deleteVehicle);

export { router as vehiclesRouter }; 
