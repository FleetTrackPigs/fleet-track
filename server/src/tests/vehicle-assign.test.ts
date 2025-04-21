import request from 'supertest'
import { app } from '../index'
import { supabase } from '../config/supabase'

jest.mock('../config/supabase', () => ({
  supabase: {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn(),
    data: null,
    error: null,
    update: jest.fn().mockReturnThis(),
    match: jest.fn().mockReturnThis(),
    is: jest.fn().mockReturnThis(),
    maybeSingle: jest.fn()
  }
}))

describe('Vehicle Assignment', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('should assign a vehicle to a driver', async () => {
    // Mock vehicle exists
    const mockVehicle = {
      id: '123',
      status: 'available',
      make: 'Toyota',
      model: 'Camry'
    }
    ;(supabase.single as jest.Mock).mockResolvedValueOnce({
      data: mockVehicle,
      error: null
    })

    // Mock driver exists
    const mockDriver = {
      id: '456',
      name: 'John Doe',
      status: 'active',
      vehicleid: null
    }
    ;(supabase.single as jest.Mock).mockResolvedValueOnce({
      data: mockDriver,
      error: null
    })

    // Mock driver not already assigned
    ;(supabase.maybeSingle as jest.Mock).mockResolvedValueOnce({
      data: null,
      error: null
    })

    // Mock update driver successful
    ;(supabase.update as jest.Mock).mockResolvedValueOnce({
      data: { ...mockDriver, vehicleid: '123' },
      error: null
    })

    // Mock update vehicle successful
    ;(supabase.update as jest.Mock).mockResolvedValueOnce({
      data: { ...mockVehicle, status: 'assigned' },
      error: null
    })

    // Mock get updated vehicle and driver
    ;(supabase.single as jest.Mock).mockResolvedValueOnce({
      data: { ...mockVehicle, status: 'assigned' },
      error: null
    })
    ;(supabase.single as jest.Mock).mockResolvedValueOnce({
      data: { ...mockDriver, vehicleid: '123' },
      error: null
    })

    const response = await request(app)
      .post('/api/vehicles/assign')
      .send({ vehicleId: '123', driverId: '456' })
      .expect(200)

    expect(response.body).toHaveProperty('success', true)
    expect(response.body).toHaveProperty('data')
    expect(response.body.data).toHaveProperty('vehicle')
    expect(response.body.data).toHaveProperty('driver')
    expect(response.body.data.vehicle.status).toBe('assigned')
    expect(response.body.data.driver.vehicleid).toBe('123')
  })

  test('should unassign a vehicle from a driver', async () => {
    // Mock vehicle exists
    const mockVehicle = {
      id: '123',
      status: 'assigned',
      make: 'Toyota',
      model: 'Camry'
    }
    ;(supabase.single as jest.Mock).mockResolvedValueOnce({
      data: mockVehicle,
      error: null
    })

    // Mock find driver with vehicle
    const mockDriver = {
      id: '456',
      name: 'John Doe',
      status: 'active',
      vehicleid: '123'
    }
    ;(supabase.maybeSingle as jest.Mock).mockResolvedValueOnce({
      data: mockDriver,
      error: null
    })

    // Mock update driver successful
    ;(supabase.update as jest.Mock).mockResolvedValueOnce({
      data: { ...mockDriver, vehicleid: null },
      error: null
    })

    // Mock update vehicle successful
    ;(supabase.update as jest.Mock).mockResolvedValueOnce({
      data: { ...mockVehicle, status: 'available' },
      error: null
    })

    // Mock get updated vehicle
    ;(supabase.single as jest.Mock).mockResolvedValueOnce({
      data: { ...mockVehicle, status: 'available' },
      error: null
    })
    ;(supabase.single as jest.Mock).mockResolvedValueOnce({
      data: { ...mockDriver, vehicleid: null },
      error: null
    })

    const response = await request(app)
      .post('/api/vehicles/assign')
      .send({ vehicleId: '123', driverId: null })
      .expect(200)

    expect(response.body).toHaveProperty('success', true)
    expect(response.body).toHaveProperty('data')
    expect(response.body.data).toHaveProperty('vehicle')
    expect(response.body.data.vehicle.status).toBe('available')
    expect(response.body.data.driver.vehicleid).toBe(null)
  })

  test('should return error if vehicle not found', async () => {
    ;(supabase.single as jest.Mock).mockResolvedValueOnce({
      data: null,
      error: { message: 'Vehicle not found' }
    })

    const response = await request(app)
      .post('/api/vehicles/assign')
      .send({ vehicleId: '999', driverId: '456' })
      .expect(404)

    expect(response.body).toHaveProperty('success', false)
    expect(response.body).toHaveProperty('error', 'Vehicle not found')
  })

  test('should return error if driver not found', async () => {
    // Mock vehicle exists
    const mockVehicle = {
      id: '123',
      status: 'available',
      make: 'Toyota',
      model: 'Camry'
    }
    ;(supabase.single as jest.Mock).mockResolvedValueOnce({
      data: mockVehicle,
      error: null
    })

    // Mock driver not found
    ;(supabase.single as jest.Mock).mockResolvedValueOnce({
      data: null,
      error: { message: 'Driver not found' }
    })

    const response = await request(app)
      .post('/api/vehicles/assign')
      .send({ vehicleId: '123', driverId: '999' })
      .expect(404)

    expect(response.body).toHaveProperty('success', false)
    expect(response.body).toHaveProperty('error', 'Driver not found')
  })
})
