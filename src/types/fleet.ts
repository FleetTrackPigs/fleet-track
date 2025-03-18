
export interface Vehicle {
  id: string;
  brand: string;
  model: string;
  plate: string;
  status: 'available' | 'assigned';
  driverId?: string;
}

export interface Driver {
  id: string;
  name: string;
  lastName: string;
  username: string;
  status: 'active' | 'inactive';
  vehicleId?: string;
}
