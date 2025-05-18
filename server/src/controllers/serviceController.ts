import { Request, Response, NextFunction } from 'express'
import { supabase } from '../config/supabase'
import {
  CreateServiceRequest,
  UpdateServiceRequest,
  Service,
  ServiceWithRelations
} from '../types/service'
import logger from '../utils/logger'

// Get all services
export const getAllServices = async (req: Request, res: Response) => {
  try {
    const { data: services, error } = await supabase
      .from('services')
      .select('*')
      .order('scheduled_date', { ascending: true })

    if (error) {
      logger.error('Error fetching services', { error })
      return res.status(500).json({ message: 'Error fetching services', error })
    }

    // Get related drivers and vehicles for each service
    const enhancedServices = await Promise.all(
      services.map(async service => {
        let driver = null
        let vehicle = null

        // Get driver if there's a driver_id
        if (service.driver_id) {
          const { data: driverData, error: driverError } = await supabase
            .from('drivers')
            .select('*')
            .eq('id', service.driver_id)
            .single()

          if (driverError) {
            logger.error('Error fetching driver for service', {
              serviceId: service.id,
              driverId: service.driver_id,
              error: driverError
            })
          } else {
            driver = driverData
          }
        }

        // Get vehicle if there's a vehicle_id
        if (service.vehicle_id) {
          const { data: vehicleData, error: vehicleError } = await supabase
            .from('vehicles')
            .select('*')
            .eq('id', service.vehicle_id)
            .single()

          if (vehicleError) {
            logger.error('Error fetching vehicle for service', {
              serviceId: service.id,
              vehicleId: service.vehicle_id,
              error: vehicleError
            })
          } else {
            vehicle = vehicleData
          }
        }

        return {
          ...service,
          driver,
          vehicle
        } as ServiceWithRelations
      })
    )

    res.status(200).json(enhancedServices)
  } catch (error) {
    logger.error('Get all services error', { error })
    res.status(500).json({ message: 'Internal server error' })
  }
}

// Get service by ID
export const getServiceById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const { data: service, error } = await supabase
      .from('services')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ message: 'Service not found' })
      }
      logger.error('Error fetching service', { id, error })
      return res.status(500).json({ message: 'Error fetching service', error })
    }

    // Get related driver if assigned
    let driver = null
    if (service.driver_id) {
      const { data: driverData, error: driverError } = await supabase
        .from('drivers')
        .select('*')
        .eq('id', service.driver_id)
        .single()

      if (!driverError) {
        driver = driverData
      }
    }

    // Get related vehicle if assigned
    let vehicle = null
    if (service.vehicle_id) {
      const { data: vehicleData, error: vehicleError } = await supabase
        .from('vehicles')
        .select('*')
        .eq('id', service.vehicle_id)
        .single()

      if (!vehicleError) {
        vehicle = vehicleData
      }
    }

    const enhancedService = {
      ...service,
      driver,
      vehicle
    }

    res.status(200).json(enhancedService)
  } catch (error) {
    logger.error('Get service by ID error', { error, id: req.params.id })
    res.status(500).json({ message: 'Internal server error' })
  }
}

// Create a new service
export const createService = async (
  req: Request<object, unknown, CreateServiceRequest>,
  res: Response
) => {
  try {
    const {
      name,
      description,
      driver_id,
      vehicle_id,
      start_address,
      end_address,
      start_lat,
      start_lng,
      end_lat,
      end_lng,
      scheduled_date,
      notes,
      status = 'pending'
    } = req.body

    // Validate that required coordinates are provided
    if (!start_lat || !start_lng || !end_lat || !end_lng) {
      return res.status(400).json({
        message: 'Start and end coordinates are required'
      })
    }

    // Create the service
    const { data, error } = await supabase
      .from('services')
      .insert([
        {
          name,
          description,
          driver_id,
          vehicle_id,
          start_address,
          end_address,
          start_lat,
          start_lng,
          end_lat,
          end_lng,
          scheduled_date,
          notes,
          status
        }
      ])
      .select()
      .single()

    if (error) {
      logger.error('Error creating service', { error, body: req.body })
      return res.status(400).json({ message: 'Error creating service', error })
    }

    res.status(201).json(data)
  } catch (error) {
    logger.error('Create service error', { error })
    res.status(500).json({ message: 'Internal server error' })
  }
}

// Update a service
export const updateService = async (
  req: Request<{ id: string }, unknown, UpdateServiceRequest>,
  res: Response
) => {
  try {
    const { id } = req.params
    const updates = req.body

    // Check if service exists
    const { data: existingService, error: checkError } = await supabase
      .from('services')
      .select('id')
      .eq('id', id)
      .single()

    if (checkError) {
      if (checkError.code === 'PGRST116') {
        return res.status(404).json({ message: 'Service not found' })
      }
      throw checkError
    }

    // Update the service
    const { data, error } = await supabase
      .from('services')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      logger.error('Error updating service', { error, id, updates })
      return res.status(400).json({ message: 'Error updating service', error })
    }

    res.status(200).json(data)
  } catch (error) {
    logger.error('Update service error', { error, id: req.params.id })
    res.status(500).json({ message: 'Internal server error' })
  }
}

// Delete a service
export const deleteService = async (
  req: Request<{ id: string }, unknown, unknown>,
  res: Response
) => {
  try {
    const { id } = req.params

    // Check if service exists
    const { data: existingService, error: checkError } = await supabase
      .from('services')
      .select('id')
      .eq('id', id)
      .single()

    if (checkError) {
      if (checkError.code === 'PGRST116') {
        return res.status(404).json({ message: 'Service not found' })
      }
      throw checkError
    }

    // Delete the service
    const { error } = await supabase.from('services').delete().eq('id', id)

    if (error) {
      logger.error('Error deleting service', { error, id })
      return res.status(400).json({ message: 'Error deleting service', error })
    }

    res.status(204).send()
  } catch (error) {
    logger.error('Delete service error', { error, id: req.params.id })
    res.status(500).json({ message: 'Internal server error' })
  }
}

// Get services for driver
export const getDriverServices = async (req: Request, res: Response) => {
  try {
    const { driverId } = req.params

    const { data: services, error } = await supabase
      .from('services')
      .select('*')
      .eq('driver_id', driverId)
      .order('scheduled_date', { ascending: true })

    if (error) {
      logger.error('Error fetching driver services', { error, driverId })
      return res
        .status(500)
        .json({ message: 'Error fetching driver services', error })
    }

    // Enhance with vehicle data
    const enhancedServices = await Promise.all(
      services.map(async service => {
        let vehicle = null
        if (service.vehicle_id) {
          const { data: vehicleData, error: vehicleError } = await supabase
            .from('vehicles')
            .select('*')
            .eq('id', service.vehicle_id)
            .single()

          if (!vehicleError) {
            vehicle = vehicleData
          }
        }

        return {
          ...service,
          vehicle
        }
      })
    )

    res.status(200).json(enhancedServices)
  } catch (error) {
    logger.error('Get driver services error', {
      error,
      driverId: req.params.driverId
    })
    res.status(500).json({ message: 'Internal server error' })
  }
}

// Update service status
export const updateServiceStatus = async (
  req: Request<
    { id: string },
    unknown,
    { status: string; start_time?: string; end_time?: string }
  >,
  res: Response
) => {
  try {
    const { id } = req.params
    const { status, start_time, end_time } = req.body

    // Validate status
    const validStatuses = ['pending', 'in-progress', 'completed', 'cancelled']
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      })
    }

    const updates: any = { status }

    // If status is in-progress and no start time provided, set it now
    if (status === 'in-progress' && !start_time) {
      updates.start_time = new Date().toISOString()
    }

    // If status is completed and no end time provided, set it now
    if (status === 'completed' && !end_time) {
      updates.end_time = new Date().toISOString()
    }

    // Update the service status
    const { data, error } = await supabase
      .from('services')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      logger.error('Error updating service status', { error, id, status })
      return res
        .status(400)
        .json({ message: 'Error updating service status', error })
    }

    res.status(200).json(data)
  } catch (error) {
    logger.error('Update service status error', { error, id: req.params.id })
    res.status(500).json({ message: 'Internal server error' })
  }
}
