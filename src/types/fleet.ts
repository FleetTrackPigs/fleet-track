export interface Vehicle {
  id: string
  brand: string
  model: string
  plate: string
  status: 'available' | 'assigned'
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
