import { Request, Response } from 'express'
import { validationResult } from 'express-validator'
import { supabase } from '../config/supabase'
import logger from '../utils/logger'

/**
 * Get all vehicle reviews
 */
export const getAllVehicleReviews = async (req: Request, res: Response) => {
  try {
    // Optional query params for filtering
    const { driver_id, vehicle_id, status } = req.query

    // Build query with filters
    let query = supabase
      .from('vehicle_reviews_detailed')
      .select('*')
      .order('review_date', { ascending: false })

    // Apply filters if provided
    if (driver_id) {
      query = query.eq('driver_id', driver_id)
    }
    if (vehicle_id) {
      query = query.eq('vehicle_id', vehicle_id)
    }
    if (status) {
      query = query.eq('status', status)
    }

    const { data, error } = await query

    if (error) {
      logger.error('Error fetching vehicle reviews:', error.message)
      return res.status(500).json({ error: 'Error fetching vehicle reviews' })
    }

    return res.status(200).json(data)
  } catch (error) {
    logger.error('Error in getAllVehicleReviews:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

/**
 * Get vehicle review by ID
 */
export const getVehicleReviewById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const { data, error } = await supabase
      .from('vehicle_reviews_detailed')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      logger.error(`Error fetching vehicle review ${id}:`, error.message)
      return res.status(404).json({ error: 'Vehicle review not found' })
    }

    return res.status(200).json(data)
  } catch (error) {
    logger.error('Error in getVehicleReviewById:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

/**
 * Get vehicle reviews by vehicle ID
 */
export const getVehicleReviewsByVehicleId = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params

    const { data, error } = await supabase
      .from('vehicle_reviews_detailed')
      .select('*')
      .eq('vehicle_id', id)
      .order('review_date', { ascending: false })

    if (error) {
      logger.error(
        `Error fetching vehicle reviews for vehicle ${id}:`,
        error.message
      )
      return res.status(500).json({ error: 'Error fetching vehicle reviews' })
    }

    return res.status(200).json(data)
  } catch (error) {
    logger.error('Error in getVehicleReviewsByVehicleId:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

/**
 * Create a new vehicle review
 */
export const createVehicleReview = async (req: Request, res: Response) => {
  try {
    // Validate request body
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const {
      driver_id,
      vehicle_id,
      lights_working,
      brakes_working,
      tires_condition,
      fluids_checked,
      clean_interior,
      issues_noted
    } = req.body

    // Insert review into the database
    const { data, error } = await supabase
      .from('vehicle_reviews')
      .insert({
        driver_id,
        vehicle_id,
        lights_working,
        brakes_working,
        tires_condition,
        fluids_checked,
        clean_interior,
        issues_noted: issues_noted || null
      })
      .select()
      .single()

    if (error) {
      logger.error('Error creating vehicle review:', error.message)
      return res.status(500).json({ error: 'Error creating vehicle review' })
    }

    logger.info(
      `Vehicle review created for vehicle ${vehicle_id} by driver ${driver_id}`
    )
    return res.status(201).json(data)
  } catch (error) {
    logger.error('Error in createVehicleReview:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

/**
 * Get vehicles requiring maintenance (admin only)
 */
export const getVehiclesRequiringMaintenance = async (
  req: Request,
  res: Response
) => {
  try {
    // Use a SQL query to find vehicles with problems in their latest review
    const { data, error } = await supabase.rpc(
      'get_vehicles_requiring_maintenance'
    )

    if (error) {
      logger.error(
        'Error fetching vehicles requiring maintenance:',
        error.message
      )
      return res.status(500).json({ error: 'Database error' })
    }

    return res.status(200).json(data || [])
  } catch (error) {
    logger.error('Error in getVehiclesRequiringMaintenance:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
