import { Request, Response } from 'express'
import { validationResult } from 'express-validator'
import { supabase } from '../config/supabase'
import logger from '../utils/logger'

/**
 * Get all scheduled maintenance
 */
export const getAllScheduledMaintenance = async (
  req: Request,
  res: Response
) => {
  try {
    const { vehicle_id } = req.query

    // Build query with filters
    let query = supabase
      .from('maintenance_schedules')
      .select('*, vehicles(brand, model, plate)')
      .order('scheduled_date', { ascending: true })

    // Apply vehicle filter if provided
    if (vehicle_id) {
      query = query.eq('vehicle_id', vehicle_id)
    }

    const { data, error } = await query

    if (error) {
      logger.error('Error fetching maintenance schedules:', error.message)
      return res
        .status(500)
        .json({ error: 'Error fetching maintenance schedules' })
    }

    return res.status(200).json(data)
  } catch (error) {
    logger.error('Error in getAllScheduledMaintenance:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

/**
 * Get scheduled maintenance by ID
 */
export const getScheduledMaintenanceById = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params

    const { data, error } = await supabase
      .from('maintenance_schedules')
      .select('*, vehicles(brand, model, plate)')
      .eq('id', id)
      .single()

    if (error) {
      logger.error(`Error fetching maintenance schedule ${id}:`, error.message)
      return res.status(404).json({ error: 'Maintenance schedule not found' })
    }

    return res.status(200).json(data)
  } catch (error) {
    logger.error('Error in getScheduledMaintenanceById:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

/**
 * Create a new maintenance schedule
 */
export const createMaintenanceSchedule = async (
  req: Request,
  res: Response
) => {
  try {
    // Validate request body
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const {
      vehicle_id,
      scheduled_date,
      maintenance_type,
      description,
      status = 'pending'
    } = req.body

    // Insert maintenance schedule into the database
    const { data, error } = await supabase
      .from('maintenance_schedules')
      .insert({
        vehicle_id,
        scheduled_date,
        maintenance_type,
        description,
        status
      })
      .select()
      .single()

    if (error) {
      logger.error('Error creating maintenance schedule:', error.message)
      return res
        .status(500)
        .json({ error: 'Error creating maintenance schedule' })
    }

    logger.info(`Maintenance schedule created for vehicle ${vehicle_id}`)

    // Update vehicle status to maintenance if markAsMaintenanceNow is true
    if (req.body.markAsMaintenanceNow) {
      const { error: updateError } = await supabase
        .from('vehicles')
        .update({ status: 'maintenance' })
        .eq('id', vehicle_id)

      if (updateError) {
        logger.error('Error updating vehicle status:', updateError.message)
        return res.status(500).json({
          message:
            'Maintenance schedule created but failed to update vehicle status',
          data
        })
      }
    }

    return res.status(201).json(data)
  } catch (error) {
    logger.error('Error in createMaintenanceSchedule:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

/**
 * Update a maintenance schedule
 */
export const updateMaintenanceSchedule = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params
    const { scheduled_date, maintenance_type, description, status } = req.body

    const { data, error } = await supabase
      .from('maintenance_schedules')
      .update({
        scheduled_date,
        maintenance_type,
        description,
        status
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      logger.error('Error updating maintenance schedule:', error.message)
      return res
        .status(500)
        .json({ error: 'Error updating maintenance schedule' })
    }

    logger.info(`Maintenance schedule ${id} updated`)
    return res.status(200).json(data)
  } catch (error) {
    logger.error('Error in updateMaintenanceSchedule:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

/**
 * Delete a maintenance schedule
 */
export const deleteMaintenanceSchedule = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params

    const { error } = await supabase
      .from('maintenance_schedules')
      .delete()
      .eq('id', id)

    if (error) {
      logger.error('Error deleting maintenance schedule:', error.message)
      return res
        .status(500)
        .json({ error: 'Error deleting maintenance schedule' })
    }

    logger.info(`Maintenance schedule ${id} deleted`)
    return res.status(204).json()
  } catch (error) {
    logger.error('Error in deleteMaintenanceSchedule:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
