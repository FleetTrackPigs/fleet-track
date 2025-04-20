import { Request, Response } from 'express'
import { supabase } from '../config/supabase'
import {
  Driver,
  CreateDriverRequest,
  UpdateDriverRequest
} from '../types/driver'

// Get all drivers with their user information
export const getAllDrivers = async (req: Request, res: Response) => {
  try {
    const { data: drivers, error } = await supabase.from('drivers').select(`
        *,
        user:userid (
          id,
          username,
          email,
          role
        )
      `)

    if (error) throw error

    return res.status(200).json({
      success: true,
      message: 'Drivers retrieved successfully',
      data: drivers
    })
  } catch (error: Error | unknown) {
    console.error('Error in getAllDrivers:', error)
    return res.status(500).json({
      success: false,
      message:
        error instanceof Error ? error.message : 'Failed to retrieve drivers',
      error: error instanceof Error ? error.toString() : String(error)
    })
  }
}

// Get driver by ID
export const getDriverById = async (req: Request, res: Response) => {
  const { id } = req.params

  try {
    const { data: driver, error } = await supabase
      .from('drivers')
      .select(
        `
        *,
        user:userid (
          id,
          username,
          email,
          role
        )
      `
      )
      .eq('id', id)
      .single()

    if (error) throw error

    if (!driver) {
      return res.status(404).json({
        success: false,
        message: 'Driver not found'
      })
    }

    return res.status(200).json({
      success: true,
      message: 'Driver retrieved successfully',
      data: driver
    })
  } catch (error: Error | unknown) {
    return res.status(500).json({
      success: false,
      message:
        error instanceof Error ? error.message : 'Failed to retrieve driver',
      error
    })
  }
}

// Create a new driver
export const createDriver = async (req: Request, res: Response) => {
  const driverData: CreateDriverRequest = req.body

  try {
    // Check if userId exists
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('id', driverData.userId)
      .single()

    if (userError) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    // Check if a driver already exists for this user
    const { data: existingDriver, error: driverError } = await supabase
      .from('drivers')
      .select('id')
      .eq('userid', driverData.userId)
      .single()

    if (existingDriver) {
      return res.status(400).json({
        success: false,
        message: 'This user already has a driver profile'
      })
    }

    // Create new driver
    const { data: newDriver, error } = await supabase
      .from('drivers')
      .insert([
        {
          userid: driverData.userId,
          name: driverData.name,
          lastname: driverData.lastName,
          phone: driverData.phone || null,
          license_type: driverData.license_type || null,
          license_expiry: driverData.license_expiry || null,
          status: driverData.status || 'active'
        }
      ])
      .select(
        `
        *,
        user:userid (
          id,
          username,
          email,
          role
        )
      `
      )
      .single()

    if (error) throw error

    return res.status(201).json({
      success: true,
      message: 'Driver created successfully',
      data: newDriver
    })
  } catch (error: Error | unknown) {
    return res.status(500).json({
      success: false,
      message:
        error instanceof Error ? error.message : 'Failed to create driver',
      error
    })
  }
}

// Update driver
export const updateDriver = async (req: Request, res: Response) => {
  const { id } = req.params
  const driverData: UpdateDriverRequest = req.body

  try {
    // Check if driver exists
    const { data: existingDriver, error: driverError } = await supabase
      .from('drivers')
      .select('*')
      .eq('id', id)
      .single()

    if (driverError) throw driverError

    if (!existingDriver) {
      return res.status(404).json({
        success: false,
        message: 'Driver not found'
      })
    }

    // Update driver
    const updateData = {
      ...(driverData.name && { name: driverData.name }),
      ...(driverData.lastName && { lastname: driverData.lastName }),
      ...(driverData.phone !== undefined && { phone: driverData.phone }),
      ...(driverData.license_type !== undefined && {
        license_type: driverData.license_type
      }),
      ...(driverData.license_expiry !== undefined && {
        license_expiry: driverData.license_expiry
      }),
      ...(driverData.status && { status: driverData.status }),
      ...(driverData.vehicleId !== undefined && {
        vehicleid: driverData.vehicleId
      })
    }

    const { data: updatedDriver, error } = await supabase
      .from('drivers')
      .update(updateData)
      .eq('id', id)
      .select(
        `
        *,
        user:userid (
          id,
          username,
          email,
          role
        )
      `
      )
      .single()

    if (error) throw error

    return res.status(200).json({
      success: true,
      message: 'Driver updated successfully',
      data: updatedDriver
    })
  } catch (error: Error | unknown) {
    return res.status(500).json({
      success: false,
      message:
        error instanceof Error ? error.message : 'Failed to update driver',
      error
    })
  }
}

// Delete driver
export const deleteDriver = async (req: Request, res: Response) => {
  const { id } = req.params

  try {
    // Check if the driver has a vehicle assigned
    const { data: driver, error: driverError } = await supabase
      .from('drivers')
      .select('vehicleid')
      .eq('id', id)
      .single()

    if (driverError) throw driverError

    if (!driver) {
      return res.status(404).json({
        success: false,
        message: 'Driver not found'
      })
    }

    // If driver has a vehicle, update vehicle status
    if (driver.vehicleid) {
      const { error: vehicleError } = await supabase
        .from('vehicles')
        .update({
          status: 'available',
          driverid: null
        })
        .eq('id', driver.vehicleid)

      if (vehicleError) throw vehicleError
    }

    // Delete driver
    const { error } = await supabase.from('drivers').delete().eq('id', id)

    if (error) throw error

    return res.status(200).json({
      success: true,
      message: 'Driver deleted successfully'
    })
  } catch (error: Error | unknown) {
    return res.status(500).json({
      success: false,
      message:
        error instanceof Error ? error.message : 'Failed to delete driver',
      error
    })
  }
}
