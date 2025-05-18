import { Driver } from './driver'
import { Vehicle } from './vehicle'

export type ServiceStatus =
  | 'pending'
  | 'in-progress'
  | 'completed'
  | 'cancelled'

export interface Service {
  id: string
  name: string
  description: string | null
  driver_id: string | null
  vehicle_id: string | null
  start_address: string
  end_address: string
  start_lat: number
  start_lng: number
  end_lat: number
  end_lng: number
  scheduled_date: string | null
  start_time: string | null
  end_time: string | null
  status: ServiceStatus
  notes: string | null
  created_at: string
  updated_at: string
}

export interface ServiceWithRelations extends Service {
  driver?: Driver | null
  vehicle?: Vehicle | null
}

export interface CreateServiceRequest {
  name: string
  description?: string
  driver_id?: string
  vehicle_id?: string
  start_address: string
  end_address: string
  start_lat: number
  start_lng: number
  end_lat: number
  end_lng: number
  scheduled_date?: string
  notes?: string
  status?: ServiceStatus
}

export interface UpdateServiceRequest {
  name?: string
  description?: string
  driver_id?: string | null
  vehicle_id?: string | null
  start_address?: string
  end_address?: string
  start_lat?: number
  start_lng?: number
  end_lat?: number
  end_lng?: number
  scheduled_date?: string | null
  start_time?: string | null
  end_time?: string | null
  status?: ServiceStatus
  notes?: string | null
}
