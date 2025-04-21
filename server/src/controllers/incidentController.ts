import { Request, Response, NextFunction } from 'express'
import { supabase } from '../config/supabase'
import { Incident } from '../types/incidents'
import logger from '../utils/logger'

/**
 * Get all incidents
 */
export const getAllIncidents = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { data, error } = await supabase.from('incidents').select('*')

    if (error) {
      logger.error('Error fetching incidents:', error)
      return next(error)
    }

    res.status(200).json(data)
  } catch (error) {
    next(error)
  }
}

/**
 * Get incident by ID
 */
export const getIncidentById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params

  try {
    const { data, error } = await supabase
      .from('incidents')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      logger.error(`Error fetching incident with ID ${id}:`, error)
      return next(error)
    }

    if (!data) {
      return res.status(404).json({ message: 'Incident not found' })
    }

    res.status(200).json(data)
  } catch (error) {
    next(error)
  }
}

/**
 * Get incidents by vehicle ID
 */
export const getIncidentsByVehicleId = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { vehicleId } = req.params

  try {
    const { data, error } = await supabase
      .from('incidents')
      .select('*')
      .eq('vehicle_id', vehicleId)

    if (error) {
      logger.error(`Error fetching incidents for vehicle ${vehicleId}:`, error)
      return next(error)
    }

    res.status(200).json(data)
  } catch (error) {
    next(error)
  }
}

/**
 * Get incidents by driver ID
 */
export const getIncidentsByDriverId = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { driverId } = req.params

  try {
    const { data, error } = await supabase
      .from('incidents')
      .select('*')
      .eq('driver_id', driverId)

    if (error) {
      logger.error(`Error fetching incidents for driver ${driverId}:`, error)
      return next(error)
    }

    res.status(200).json(data)
  } catch (error) {
    next(error)
  }
}

/**
 * Create a new incident
 */
export const createIncident = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const incidentData: Incident = req.body

    // Validate required fields
    if (
      !incidentData.vehicle_id ||
      !incidentData.description ||
      !incidentData.incident_date
    ) {
      return res.status(400).json({
        message: 'Vehicle ID, description, and incident_date are required'
      })
    }

    const { data, error } = await supabase
      .from('incidents')
      .insert(incidentData)
      .select()
      .single()

    if (error) {
      logger.error('Error creating incident:', error)
      return next(error)
    }

    res.status(201).json(data)
  } catch (error) {
    next(error)
  }
}

/**
 * Update an incident
 */
export const updateIncident = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params
  const incidentData: Partial<Incident> = req.body

  try {
    const { data, error } = await supabase
      .from('incidents')
      .update(incidentData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      logger.error(`Error updating incident with ID ${id}:`, error)
      return next(error)
    }

    if (!data) {
      return res.status(404).json({ message: 'Incident not found' })
    }

    res.status(200).json(data)
  } catch (error) {
    next(error)
  }
}

/**
 * Delete an incident
 */
export const deleteIncident = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params

  try {
    const { error } = await supabase.from('incidents').delete().eq('id', id)

    if (error) {
      logger.error(`Error deleting incident with ID ${id}:`, error)
      return next(error)
    }

    res.status(204).send()
  } catch (error) {
    next(error)
  }
}
