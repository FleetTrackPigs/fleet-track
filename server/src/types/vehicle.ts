export interface Vehicle {
  id: string;
  brand: string;
  model: string;
  plate: string;
  status: 'available' | 'assigned';
  driverId?: string;
}

export interface CreateVehicleRequest {
  brand: string;
  model: string;
  plate: string;
}

export interface UpdateVehicleRequest {
  brand?: string;
  model?: string;
  plate?: string;
  status?: 'available' | 'assigned';
  driverId?: string | null;
} 
