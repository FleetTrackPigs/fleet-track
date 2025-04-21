const API_URL = import.meta.env.VITE_API_URL

interface ApiResponse<T = any> {
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

  getVehicleById: (id: string, token: string) =>
    apiRequest(`/vehicles/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }),

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
  ) =>
    apiRequest(`/vehicles/${id}/status`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ status, maintenanceData })
    }),

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
  create: async (reviewData: any, token: string) => {
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
    const response = await apiRequest(
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
