export interface Vehicle {
  id: string
  brand: string
  model: string
  plate: string
  status: 'available' | 'assigned'
  driverId?: string
}

export interface User {
  id: string
  username: string
  email: string
  role: 'admin' | 'driver'
}

export interface Driver {
  id: string
  userId: string
  name: string
  lastName: string
  phone?: string
  license_type?: string
  license_expiry?: string
  status: 'active' | 'inactive'
  vehicleId?: string
  user?: User
}
