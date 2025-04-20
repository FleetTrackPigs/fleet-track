export interface Driver {
  id: string
  userid: string
  name: string
  lastname: string
  phone?: string
  license_type?: string
  license_expiry?: Date
  status: 'active' | 'inactive'
  vehicleid?: string
  created_at?: Date
  updated_at?: Date
}

export interface CreateDriverRequest {
  userId: string
  name: string
  lastName: string
  phone?: string
  license_type?: string
  license_expiry?: string
  status?: 'active' | 'inactive'
}

export interface UpdateDriverRequest {
  name?: string
  lastName?: string
  phone?: string
  license_type?: string
  license_expiry?: string
  status?: 'active' | 'inactive'
  vehicleId?: string | null
}
