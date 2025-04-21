export interface Vehicle {
  id: string
  make: string
  model: string
  year: number
  license_plate: string
  vin: string
  status: 'active' | 'maintenance' | 'inactive'
  current_driver_id?: string
  created_at: string
  updated_at: string
}

export interface Driver {
  id: string
  user_id: string
  license_number: string
  license_expiry: string
  status: 'active' | 'inactive'
  created_at: string
  updated_at: string
}

export interface Incident {
  id?: string
  vehicle_id: string
  driver_id?: string
  description: string
  date: string
  location?: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  status: 'reported' | 'investigating' | 'resolved'
  resolved_date?: string
  notes?: string
  created_at?: string
  updated_at?: string
}
