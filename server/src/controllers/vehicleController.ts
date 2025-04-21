import { Request, Response, NextFunction } from 'express'
import { supabase } from '../config/supabase'
import {
  CreateVehicleRequest,
  UpdateVehicleRequest,
  Vehicle
} from '../types/vehicle'
import { validationResult } from 'express-validator'
import logger from '../utils/logger'

// Get all vehicles
export const getAllVehicles = async (req: Request, res: Response) => {
  try {
    // 1. Get all vehicles
    const { data: vehicles, error: vehiclesError } = await supabase
      .from('vehicles')
      .select('*')

    if (vehiclesError) {
      return res
        .status(500)
        .json({ message: 'Error fetching vehicles', error: vehiclesError })
    }

    // 2. Get all drivers that have a vehicleid (assigned to a vehicle)
    const { data: drivers, error: driversError } = await supabase
      .from('drivers')
      .select('id, name, lastname, vehicleid')
      .not('vehicleid', 'is', null)

    if (driversError) {
      return res
        .status(500)
        .json({ message: 'Error fetching drivers', error: driversError })
    }

    // 3. Create a map of vehicleId -> driver for quick lookups
    const driversByVehicleId = drivers.reduce((map, driver) => {
      if (driver.vehicleid) {
        map[driver.vehicleid] = driver
      }
      return map
    }, {} as Record<string, (typeof drivers)[0]>)

    // 4. Enhance vehicles with driver info
    const enhancedVehicles = vehicles.map(vehicle => ({
      ...vehicle,
      driver: driversByVehicleId[vehicle.id] || null
    }))

    res.status(200).json(enhancedVehicles)
  } catch (error) {
    console.error('Get vehicles error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// Get vehicle by ID
export const getVehicleById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    // 1. Get the vehicle
    const { data: vehicle, error: vehicleError } = await supabase
      .from('vehicles')
      .select('*')
      .eq('id', id)
      .single()

    if (vehicleError) {
      // Distinguish between not found and other errors
      if (vehicleError.code === 'PGRST116') {
        return res.status(404).json({ message: 'Vehicle not found' })
      }
      return res
        .status(500)
        .json({ message: 'Error fetching vehicle', error: vehicleError })
    }

    // 2. Get the assigned driver, if any
    const { data: driver, error: driverError } = await supabase
      .from('drivers')
      .select('id, name, lastname')
      .eq('vehicleid', id)
      .maybeSingle() // Use maybeSingle to handle the case where no driver is assigned

    if (driverError) {
      return res
        .status(500)
        .json({ message: 'Error fetching driver', error: driverError })
    }

    // 3. Combine the data
    const enhancedVehicle = {
      ...vehicle,
      driver: driver || null
    }

    res.status(200).json(enhancedVehicle)
  } catch (error) {
    console.error('Get vehicle error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// Create a new vehicle
export const createVehicle = async (
  req: Request<object, unknown, CreateVehicleRequest>,
  res: Response
) => {
  try {
    const { brand, model, plate } = req.body

    // Check if plate already exists
    const { data: existingVehicle } = await supabase
      .from('vehicles')
      .select('*')
      .eq('plate', plate)
      .single()

    if (existingVehicle) {
      return res
        .status(409)
        .json({ message: 'Vehicle with this plate already exists' })
    }

    // Create new vehicle
    const { data, error } = await supabase
      .from('vehicles')
      .insert([
        {
          brand,
          model,
          plate,
          status: 'available'
        }
      ])
      .select()
      .single()

    if (error) {
      return res.status(400).json({ message: 'Error creating vehicle', error })
    }

    res.status(201).json(data)
  } catch (error) {
    console.error('Create vehicle error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// Update a vehicle
export const updateVehicle = async (
  req: Request<{ id: string }, unknown, UpdateVehicleRequest>,
  res: Response
) => {
  try {
    const { id } = req.params
    // Separate driverId from other updates - this will be used to update driver, not vehicle
    const { driverId, ...vehicleUpdates } = req.body

    // 1. Check if vehicle exists
    const { data: existingVehicle, error: checkError } = await supabase
      .from('vehicles')
      .select('id, plate, status')
      .eq('id', id)
      .single()

    if (checkError) {
      if (checkError.code === 'PGRST116') {
        return res.status(404).json({ message: 'Vehicle not found' })
      }
      throw checkError // Rethrow other errors
    }
    if (!existingVehicle) {
      return res.status(404).json({ message: 'Vehicle not found' })
    }

    // 2. Handle plate uniqueness check if plate is being updated
    if (
      vehicleUpdates.plate &&
      vehicleUpdates.plate !== existingVehicle.plate
    ) {
      const { count, error: plateCheckError } = await supabase
        .from('vehicles')
        .select('id', { count: 'exact' })
        .eq('plate', vehicleUpdates.plate)
        .neq('id', id) // Exclude the current vehicle

      if (plateCheckError) throw plateCheckError
      if (count !== null && count > 0) {
        return res
          .status(409)
          .json({ message: 'Vehicle with this plate already exists' })
      }
    }

    // 3. Find current driver assigned to this vehicle, if any
    const { data: currentAssignedDriver, error: currentDriverError } =
      await supabase
        .from('drivers')
        .select('id, status')
        .eq('vehicleid', id)
        .maybeSingle()

    if (currentDriverError) {
      throw new Error(
        `Failed to check current driver assignment: ${currentDriverError.message}`
      )
    }

    // 4. Determine the vehicle status based on driver assignment
    let finalVehicleStatus = existingVehicle.status

    // If driverId is explicit in the request, handle assignment/unassignment
    if (driverId !== undefined) {
      // If setting to null, mark vehicle as available
      if (driverId === null) {
        finalVehicleStatus = 'available'
      } else {
        // If assigning to a driver, mark as assigned
        finalVehicleStatus = 'assigned'
      }
    } else if (currentAssignedDriver) {
      // If no change requested, maintain assigned if there's a driver
      finalVehicleStatus = 'assigned'
    } else {
      // No driver now and none requested, ensure available
      finalVehicleStatus = 'available'
    }

    // 5. Update the vehicle with any direct field updates + status
    const { data: updatedVehicle, error: vehicleUpdateError } = await supabase
      .from('vehicles')
      .update({
        ...vehicleUpdates,
        status: finalVehicleStatus
      })
      .eq('id', id)
      .select()
      .single()

    if (vehicleUpdateError) {
      throw new Error(
        `Failed to update vehicle ${id}: ${vehicleUpdateError.message}`
      )
    }

    // 6. Handle driver assignment changes if driverId is specified
    if (driverId !== undefined) {
      // 6a. If current driver exists, unassign them
      if (currentAssignedDriver) {
        const { error: unassignError } = await supabase
          .from('drivers')
          .update({ vehicleid: null })
          .eq('id', currentAssignedDriver.id)

        if (unassignError) {
          throw new Error(
            `Failed to unassign previous driver: ${unassignError.message}`
          )
        }
      }

      // 6b. If a new driver is provided, assign the vehicle to them
      if (driverId !== null) {
        // Check if target driver exists and is active
        const { data: targetDriver, error: driverCheckError } = await supabase
          .from('drivers')
          .select('id, vehicleid, status')
          .eq('id', driverId)
          .single()

        if (driverCheckError) {
          throw new Error(
            `Failed to find driver ${driverId}: ${driverCheckError.message}`
          )
        }

        if (targetDriver.status !== 'active') {
          return res
            .status(400)
            .json({ message: `Driver ${driverId} is not active.` })
        }

        if (targetDriver.vehicleid && targetDriver.vehicleid !== id) {
          // If driver is already assigned to a different vehicle
          return res.status(409).json({
            message: `Driver ${driverId} is already assigned to another vehicle.`
          })
        }

        // Assign vehicle to driver
        const { error: assignError } = await supabase
          .from('drivers')
          .update({ vehicleid: id })
          .eq('id', driverId)

        if (assignError) {
          throw new Error(
            `Failed to assign vehicle to driver ${driverId}: ${assignError.message}`
          )
        }
      }
    }

    // 7. Get the updated driver info (if any) to return in the response
    const { data: updatedDriver, error: driverFetchError } = await supabase
      .from('drivers')
      .select('id, name, lastname')
      .eq('vehicleid', id)
      .maybeSingle()

    if (driverFetchError) {
      throw new Error(
        `Failed to fetch updated driver information: ${driverFetchError.message}`
      )
    }

    // 8. Return the combined data
    const finalResponse = {
      ...updatedVehicle,
      driver: updatedDriver || null
    }

    res.status(200).json(finalResponse)
  } catch (error: unknown) {
    console.error('Update vehicle error:', error)
    const message =
      error instanceof Error
        ? error.message
        : 'Internal server error during vehicle update'
    const statusCode = message.includes('not found')
      ? 404
      : message.includes('already assigned') ||
        message.includes('already exists')
      ? 409
      : 500
    res.status(statusCode).json({ message, error: String(error) })
  }
}

// Delete a vehicle
export const deleteVehicle = async (
  req: Request<{ id: string }, unknown, unknown>,
  res: Response
) => {
  try {
    const { id } = req.params

    // 1. Check if vehicle exists
    const { data: vehicle, error: checkError } = await supabase
      .from('vehicles')
      .select('id')
      .eq('id', id)
      .single()

    if (checkError) {
      if (checkError.code === 'PGRST116') {
        return res.status(404).json({ message: 'Vehicle not found' })
      }
      throw checkError
    }

    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' })
    }

    // 2. Check if any driver is assigned to this vehicle
    const { data: assignedDriver, error: driverCheckError } = await supabase
      .from('drivers')
      .select('id')
      .eq('vehicleid', id)
      .maybeSingle()

    if (driverCheckError) {
      throw new Error(
        `Failed to check for assigned drivers: ${driverCheckError.message}`
      )
    }

    // 3. If a driver is assigned, unassign them first
    if (assignedDriver) {
      const { error: unassignError } = await supabase
        .from('drivers')
        .update({ vehicleid: null })
        .eq('id', assignedDriver.id)

      if (unassignError) {
        throw new Error(`Failed to unassign driver: ${unassignError.message}`)
      }
    }

    // 4. Delete the vehicle
    const { error: deleteError } = await supabase
      .from('vehicles')
      .delete()
      .eq('id', id)

    if (deleteError) {
      throw new Error(`Failed to delete vehicle: ${deleteError.message}`)
    }

    res.status(200).json({ message: 'Vehicle deleted successfully' })
  } catch (error: unknown) {
    console.error('Delete vehicle error:', error)
    const message =
      error instanceof Error
        ? error.message
        : 'Internal server error during vehicle deletion'
    const statusCode = message.includes('not found') ? 404 : 500
    res.status(statusCode).json({ message, error: String(error) })
  }
}

// Assign or unassign a vehicle to a driver
export const assignVehicle = async (
  req: Request<
    unknown,
    unknown,
    { vehicleId: string; driverId: string | null }
  >,
  res: Response
) => {
  try {
    const { vehicleId, driverId } = req.body

    // 1. Check if vehicle exists
    const { data: vehicle, error: vehicleError } = await supabase
      .from('vehicles')
      .select('id, status, plate')
      .eq('id', vehicleId)
      .single()

    if (vehicleError || !vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' })
    }

    // 2. If we're unassigning (driverId is null)
    if (driverId === null) {
      // 2.1 Find current driver assigned to this vehicle
      const { data: currentDriver, error: driverError } = await supabase
        .from('drivers')
        .select('id')
        .eq('vehicleid', vehicleId)
        .maybeSingle()

      if (driverError) {
        throw new Error(`Error checking current driver: ${driverError.message}`)
      }

      // 2.2 If there's no driver assigned, nothing to do
      if (!currentDriver) {
        return res
          .status(400)
          .json({ message: 'Vehicle is not currently assigned to any driver' })
      }

      // 2.3 Unassign the driver
      const { error: unassignError } = await supabase
        .from('drivers')
        .update({ vehicleid: null })
        .eq('id', currentDriver.id)

      if (unassignError) {
        throw new Error(`Failed to unassign driver: ${unassignError.message}`)
      }

      // 2.4 Update vehicle status to available
      const { error: statusError } = await supabase
        .from('vehicles')
        .update({ status: 'available' })
        .eq('id', vehicleId)

      if (statusError) {
        throw new Error(
          `Failed to update vehicle status: ${statusError.message}`
        )
      }

      return res.status(200).json({
        message: 'Vehicle unassigned successfully',
        vehicle: { ...vehicle, status: 'available' }
      })
    }

    // 3. If we're assigning, check if driver exists and is active
    const { data: driver, error: driverCheckError } = await supabase
      .from('drivers')
      .select('id, status, vehicleid, name')
      .eq('id', driverId)
      .single()

    if (driverCheckError || !driver) {
      return res.status(404).json({ message: 'Driver not found' })
    }

    if (driver.status !== 'active') {
      return res
        .status(400)
        .json({ message: 'Driver must be active to be assigned a vehicle' })
    }

    // 4. Check if driver is already assigned to a vehicle
    if (driver.vehicleid) {
      return res.status(400).json({
        message: 'Driver is already assigned to a vehicle. Unassign first.'
      })
    }

    // 5. Check if vehicle is already assigned to another driver
    const { data: assignedDriver, error: assignedDriverError } = await supabase
      .from('drivers')
      .select('id, name')
      .eq('vehicleid', vehicleId)
      .maybeSingle()

    if (assignedDriverError) {
      throw new Error(
        `Failed to check vehicle assignment: ${assignedDriverError.message}`
      )
    }

    if (assignedDriver) {
      return res.status(400).json({
        message: `Vehicle is already assigned to driver ${assignedDriver.name}`
      })
    }

    // 6. Assign the vehicle to the driver
    const { error: assignError } = await supabase
      .from('drivers')
      .update({ vehicleid: vehicleId })
      .eq('id', driverId)

    if (assignError) {
      throw new Error(`Failed to assign vehicle: ${assignError.message}`)
    }

    // 7. Update vehicle status to assigned
    const { error: statusError } = await supabase
      .from('vehicles')
      .update({ status: 'assigned' })
      .eq('id', vehicleId)

    if (statusError) {
      throw new Error(`Failed to update vehicle status: ${statusError.message}`)
    }

    // 8. Get updated data to return
    const { data: updatedVehicle, error: updatedVehicleError } = await supabase
      .from('vehicles')
      .select('*')
      .eq('id', vehicleId)
      .single()

    const { data: updatedDriver, error: updatedDriverError } = await supabase
      .from('drivers')
      .select('*')
      .eq('id', driverId)
      .single()

    if (updatedVehicleError || updatedDriverError) {
      throw new Error('Error retrieving updated data')
    }

    return res.status(200).json({
      message: 'Vehicle assigned successfully',
      vehicle: updatedVehicle,
      driver: updatedDriver
    })
  } catch (error: unknown) {
    console.error('Vehicle assignment error:', error)
    const message =
      error instanceof Error
        ? error.message
        : 'Internal server error during vehicle assignment'
    res.status(500).json({ message, error: String(error) })
  }
}

/**
 * Update a vehicle's status
 * @route PATCH /api/vehicles/:id/status
 */
export const updateVehicleStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params

    // Validate ID parameter
    if (!id || id === 'undefined') {
      logger.error('Invalid vehicle ID in updateVehicleStatus:', { id })
      return res.status(400).json({
        status: 'error',
        message: 'Invalid vehicle ID'
      })
    }

    const { status, maintenanceData } = req.body

    // Validate request using express-validator
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    // Update vehicle status
    const { data, error } = await supabase
      .from('vehicles')
      .update({ status })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      logger.error('Error updating vehicle status:', error)
      return next(new Error('Failed to update vehicle status'))
    }

    if (!data) {
      return next(new Error('Vehicle not found'))
    }

    // If status is 'maintenance' and maintenanceData is provided,
    // create a maintenance schedule record
    if (status === 'maintenance' && maintenanceData) {
      const {
        scheduled_date = new Date().toISOString(),
        description = 'Scheduled maintenance'
      } = maintenanceData

      // Insert maintenance schedule record
      const { data: maintenanceRecord, error: maintenanceError } =
        await supabase
          .from('maintenance_schedules')
          .insert({
            vehicle_id: id,
            scheduled_date,
            maintenance_type: 'regular',
            description,
            status: 'pending'
          })
          .select()
          .single()

      if (maintenanceError) {
        logger.error('Error creating maintenance schedule:', maintenanceError)
        // Still return success for vehicle update, but log the error
        logger.warn('Vehicle status updated but maintenance record failed')
      } else {
        logger.info(`Maintenance scheduled for vehicle ${id}`)
        return res.status(200).json({
          status: 'success',
          data: {
            vehicle: data,
            maintenance: maintenanceRecord
          }
        })
      }
    }

    res.status(200).json({
      status: 'success',
      data: {
        vehicle: data
      }
    })
  } catch (error) {
    logger.error('Error in updateVehicleStatus:', error)
    next(new Error('Failed to update vehicle status'))
  }
}
