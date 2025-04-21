export type VehicleStatus = 'available' | 'assigned' | 'maintenance'

export interface Vehicle {
  id: string
  brand: string
  model: string
  plate: string
  status: VehicleStatus
  driverid?: string
  driver?: {
    id: string
    name: string
    lastname: string
  } | null
}

export interface User {
  id: string
  username: string
  email: string
  role: 'admin' | 'driver'
}

export interface Driver {
  id: string
  userid: string
  name: string
  lastname: string
  phone?: string
  license_type?: string
  license_expiry?: string
  status: 'active' | 'inactive'
  vehicleid?: string
  user?: User
}

export type ReviewStatus = 'pending' | 'completed' | 'requires_attention'

export interface VehicleReview {
  id: string
  driver_id: string
  vehicle_id: string
  review_date: string
  lights_working: boolean
  brakes_working: boolean
  tires_condition: boolean
  fluids_checked: boolean
  clean_interior: boolean
  issues_noted: string | null
  status: ReviewStatus
  created_at: string
  updated_at: string
  driver_name?: string
  driver_lastname?: string
  vehicle_brand?: string
  vehicle_model?: string
  vehicle_plate?: string
  vehicle_status?: VehicleStatus
}
