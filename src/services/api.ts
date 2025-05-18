const API_URL = import.meta.env.VITE_API_URL

interface ApiResponse<T = unknown> {
  data?: {
    data?: T
    message?: string
    success?: boolean
  }
  error?: string
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const url = `${API_URL}${endpoint}`
    console.log(`API Request: ${options.method || 'GET'} ${url}`)

    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    }

    const response = await fetch(url, {
      ...options,
      headers
    })

    const data = await response.json()
    console.log(`API Response for ${endpoint}:`, data)

    if (!response.ok) {
      throw new Error(data.message || 'Error en la petición')
    }

    return { data }
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message }
    }
    return { error: 'Error desconocido' }
  }
}

// Auth endpoints
export const authApi = {
  login: (username: string, password: string) =>
    apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    }),

  register: (data: {
    name: string
    email: string
    lastName?: string
    username: string
    password: string
    role?: 'admin' | 'driver'
  }) =>
    apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  resetPassword: (userId: string, newPassword: string, token: string) =>
    apiRequest('/auth/reset-password', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ userId, newPassword })
    }),

  logout: () =>
    apiRequest('/auth/logout', {
      method: 'POST'
    }),

  getCurrentUser: (token: string) =>
    apiRequest('/auth/me', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }),

  getDriverUsers: (token: string) =>
    apiRequest('/auth/driver-users', {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    })
}

// Driver endpoints
export const driverApi = {
  getAllDrivers: (token: string) =>
    apiRequest('/drivers', {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    }),

  getDriverById: (id: string, token: string) =>
    apiRequest(`/drivers/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }),

  createDriver: (
    data: {
      userId: string
      name: string
      lastName: string
      phone?: string
      license_type?: string
      license_expiry?: string
      status?: 'active' | 'inactive'
    },
    token: string
  ) =>
    apiRequest('/drivers', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(data)
    }),

  updateDriver: (
    id: string,
    data: {
      name?: string
      lastName?: string
      phone?: string
      license_type?: string
      license_expiry?: string
      status?: 'active' | 'inactive'
      vehicleId?: string | null
    },
    token: string
  ) =>
    apiRequest(`/drivers/${id}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(data)
    }),

  deleteDriver: (id: string, token: string) =>
    apiRequest(`/drivers/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
}

// Vehicle endpoints
export const vehicleApi = {
  getAllVehicles: (token: string) =>
    apiRequest('/vehicles', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }),

  getVehicleById: async (id: string, token: string) => {
    console.log(`Fetching vehicle with ID: ${id}`)
    if (!id) {
      console.error('getVehicleById called with invalid ID:', id)
      return { error: 'Invalid vehicle ID' }
    }

    try {
      const response = await apiRequest(`/vehicles/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      console.log(`getVehicleById response for ${id}:`, response)

      // Si hay un error en la respuesta, lo devolvemos
      if (response.error) {
        return { error: response.error }
      }

      // Si no hay data o data es undefined/null, devolvemos un error
      if (!response.data) {
        return { error: 'No data received from server' }
      }

      // Devolvemos directamente la data
      return { data: response.data }
    } catch (error) {
      console.error(`Error in getVehicleById for ${id}:`, error)
      return { error: String(error) }
    }
  },

  createVehicle: (
    data: { brand: string; model: string; plate: string },
    token: string
  ) =>
    apiRequest('/vehicles', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(data)
    }),

  updateVehicle: (
    id: string,
    data: {
      brand?: string
      model?: string
      plate?: string
      driverId?: string | null // Include driverId for assignment
    },
    token: string
  ) =>
    apiRequest(`/vehicles/${id}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(data)
    }),

  updateVehicleStatus: (
    id: string,
    status: 'available' | 'assigned' | 'maintenance',
    token: string,
    maintenanceData?: {
      scheduled_date?: string
      description?: string
    }
  ) => {
    console.log('updateVehicleStatus called with:', {
      id,
      status,
      maintenanceData
    })
    if (!id) {
      console.error('Vehicle ID is missing in updateVehicleStatus!')
      return Promise.reject(new Error('Vehicle ID is required'))
    }

    return apiRequest(`/vehicles/${id}/status`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ status, maintenanceData })
    })
  },

  deleteVehicle: (id: string, token: string) =>
    apiRequest(`/vehicles/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
}

// Vehicle reviews API
export const vehicleReviewsApi = {
  // Get all vehicle reviews
  getAll: async (filters = {}, token: string) => {
    const queryParams = new URLSearchParams(filters)
    const response = await apiRequest(`/vehicle-reviews?${queryParams}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    return response.data
  },

  // Get vehicle review by ID
  getById: async (id: string, token: string) => {
    const response = await apiRequest(`/vehicle-reviews/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    return response.data
  },

  // Get reviews for a specific vehicle
  getByVehicleId: async (vehicleId: string, token: string) => {
    const response = await apiRequest(`/vehicle-reviews/vehicle/${vehicleId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    return response.data
  },

  // Create a new vehicle review
  create: async (reviewData: Record<string, unknown>, token: string) => {
    const response = await apiRequest('/vehicle-reviews', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(reviewData)
    })
    return response.data
  },

  // Get vehicles requiring maintenance (admin only)
  getVehiclesRequiringMaintenance: async (token: string) => {
    const response = await apiRequest<unknown>(
      '/vehicle-reviews/requiring-maintenance',
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    )
    return response.data
  }
}

// Incident API
export const incidentApi = {
  // Get all incidents
  getAll: async (token: string) => {
    const response = await apiRequest('/incidents', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    return response.data
  },

  // Get incident by ID
  getById: async (id: string, token: string) => {
    const response = await apiRequest(`/incidents/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    return response.data
  },

  // Get incidents for a specific vehicle
  getByVehicleId: async (vehicleId: string, token: string) => {
    const response = await apiRequest(`/incidents/vehicle/${vehicleId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    return response.data
  },

  // Get incidents for a specific driver
  getByDriverId: async (driverId: string, token: string) => {
    const response = await apiRequest(`/incidents/driver/${driverId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    return response.data
  },

  // Create a new incident
  create: async (
    incidentData: {
      vehicle_id: string
      driver_id: string
      incident_date: Date | string
      incident_type: 'accident' | 'breakdown' | 'violation' | 'other'
      severity: 'minor' | 'moderate' | 'major' | 'critical'
      description: string
      location?: string
      parties_involved?: string
      witnesses?: string
      police_report_number?: string
      insurance_claim_number?: string
      estimated_cost?: number
    },
    token: string
  ) => {
    const response = await apiRequest('/incidents', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(incidentData)
    })
    return response.data
  },

  // Update an incident
  update: async (
    id: string,
    incidentData: {
      vehicle_id?: string
      driver_id?: string
      incident_date?: Date | string
      incident_type?: 'accident' | 'breakdown' | 'violation' | 'other'
      severity?: 'minor' | 'moderate' | 'major' | 'critical'
      description?: string
      status?: 'reported' | 'investigating' | 'resolved' | 'closed'
      location?: string
      parties_involved?: string
      witnesses?: string
      police_report_number?: string
      insurance_claim_number?: string
      estimated_cost?: number
      actual_cost?: number
      resolution_notes?: string
      resolution_date?: Date | string
    },
    token: string
  ) => {
    const response = await apiRequest(`/incidents/${id}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(incidentData)
    })
    return response.data
  },

  // Update just the status of an incident
  updateStatus: async (
    id: string,
    statusData: {
      status: 'reported' | 'investigating' | 'resolved' | 'closed'
      resolution_notes?: string
    },
    token: string
  ) => {
    const response = await apiRequest(`/incidents/${id}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(statusData)
    })
    return response.data
  },

  // Delete an incident
  delete: async (id: string, token: string) => {
    const response = await apiRequest(`/incidents/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    return response.data
  }
}

// Service endpoints
export const serviceApi = {
  getAllServices: (token: string) =>
    apiRequest('/services', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }),

  getServiceById: (id: string, token: string) =>
    apiRequest(`/services/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }),

  getDriverServices: (driverId: string, token: string) =>
    apiRequest(`/services/driver/${driverId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }),

  createService: (
    data: {
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
      status?: 'pending' | 'in-progress' | 'completed' | 'cancelled'
    },
    token: string
  ) =>
    apiRequest('/services', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(data)
    }),

  updateService: (
    id: string,
    data: {
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
      notes?: string | null
      status?: 'pending' | 'in-progress' | 'completed' | 'cancelled'
    },
    token: string
  ) =>
    apiRequest(`/services/${id}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(data)
    }),

  deleteService: (id: string, token: string) =>
    apiRequest(`/services/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`
      }
    }),

  updateServiceStatus: (
    id: string,
    status: 'pending' | 'in-progress' | 'completed' | 'cancelled',
    token: string
  ) =>
    apiRequest(`/services/${id}/status`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ status })
    })
}
