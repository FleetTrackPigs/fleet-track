import { Router } from 'express'
import {
  getAllIncidents,
  getIncidentById,
  getIncidentsByVehicleId,
  getIncidentsByDriverId,
  createIncident,
  updateIncident,
  deleteIncident
} from '../controllers/incidentController'

const router = Router()

// GET all incidents
router.get('/', getAllIncidents)

// GET incident by ID
router.get('/:id', getIncidentById)

// GET incidents by vehicle ID
router.get('/vehicle/:vehicleId', getIncidentsByVehicleId)

// GET incidents by driver ID
router.get('/driver/:driverId', getIncidentsByDriverId)

// POST create new incident
router.post('/', createIncident)

// PUT update incident
router.put('/:id', updateIncident)

// PATCH update incident status
router.patch('/:id/status', updateIncident)

// DELETE incident
router.delete('/:id', deleteIncident)

export default router
