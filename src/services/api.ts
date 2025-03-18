const API_URL = import.meta.env.VITE_API_URL;

interface ApiResponse<T = any> {
  data?: T;
  error?: string;
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const url = `${API_URL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Error en la petición');
    }

    return { data };
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: 'Error desconocido' };
  }
}

// Auth endpoints
export const authApi = {
  login: (username: string, password: string) =>
    apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),

  register: (data: {
    name: string;
    lastName?: string;
    username: string;
    password: string;
    role?: 'admin' | 'driver';
  }) =>
    apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  logout: () =>
    apiRequest('/auth/logout', {
      method: 'POST',
    }),

  getCurrentUser: (token: string) =>
    apiRequest('/auth/me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),
}; 
