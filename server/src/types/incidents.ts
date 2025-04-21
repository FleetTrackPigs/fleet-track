export interface Incident {
  id?: string
  vehicle_id: string
  driver_id: string
  trip_id?: string
  incident_date: Date
  location?: string
  incident_type: 'accident' | 'breakdown' | 'violation' | 'other'
  severity: 'minor' | 'moderate' | 'major' | 'critical'
  description: string
  parties_involved?: string
  witnesses?: string
  police_report_number?: string
  insurance_claim_number?: string
  estimated_cost?: number
  actual_cost?: number
  status: 'reported' | 'investigating' | 'resolved' | 'closed'
  resolution_notes?: string
  resolution_date?: Date
  created_at?: Date
  updated_at?: Date
}

export interface CreateIncidentDto {
  vehicle_id: string
  driver_id: string
  trip_id?: string
  incident_date: Date
  location?: string
  incident_type: 'accident' | 'breakdown' | 'violation' | 'other'
  severity: 'minor' | 'moderate' | 'major' | 'critical'
  description: string
  parties_involved?: string
  witnesses?: string
  police_report_number?: string
  insurance_claim_number?: string
  estimated_cost?: number
}

export interface UpdateIncidentDto {
  vehicle_id?: string
  driver_id?: string
  trip_id?: string
  incident_date?: Date
  location?: string
  incident_type?: 'accident' | 'breakdown' | 'violation' | 'other'
  severity?: 'minor' | 'moderate' | 'major' | 'critical'
  description?: string
  parties_involved?: string
  witnesses?: string
  police_report_number?: string
  insurance_claim_number?: string
  estimated_cost?: number
  actual_cost?: number
  status?: 'reported' | 'investigating' | 'resolved' | 'closed'
  resolution_notes?: string
  resolution_date?: Date
}

export interface UpdateIncidentStatusDto {
  status: 'reported' | 'investigating' | 'resolved' | 'closed'
  resolution_notes?: string
}
