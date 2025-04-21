// Define the status options for an incident
export enum IncidentStatus {
  REPORTED = 'reported',
  IN_PROGRESS = 'in_progress',
  RESOLVED = 'resolved',
  CLOSED = 'closed'
}

// Define the priority levels for an incident
export enum IncidentSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

// Define the incident type
export enum IncidentType {
  MAINTENANCE = 'maintenance',
  ACCIDENT = 'accident',
  BREAKDOWN = 'breakdown',
  OTHER = 'other'
}

// Define the incident
export interface Incident {
  id: string
  title: string
  description: string
  vehicle_id: string
  driver_id: string | null
  incident_type: IncidentType
  severity: IncidentSeverity
  status: IncidentStatus
  location?: string
  notes?: string
  created_at: string
  updated_at: string
  resolved_at?: string
}

// Define the type for creating a new incident
export interface CreateIncidentDTO {
  title: string
  description: string
  vehicle_id: string
  driver_id?: string
  incident_type: IncidentType
  severity: IncidentSeverity
  location?: string
  notes?: string
}

// Define the type for updating an incident
export interface UpdateIncidentDTO {
  title?: string
  description?: string
  vehicle_id?: string
  driver_id?: string
  incident_type?: IncidentType
  severity?: IncidentSeverity
  status?: IncidentStatus
  location?: string
  notes?: string
  resolved_at?: string
}

// Define the type for updating only the status of an incident
export interface UpdateIncidentStatusDTO {
  status: IncidentStatus
  notes?: string
}
