export interface DeliveryPoint {
  id: string;
  shop_code: string;
  name: string;
  city: string;
  address: string;
  latitude: number;
  longitude: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: any | null;
}

export interface DeliveryPointFormData {
  shop_code: string;
  name: string;
  city: string;
  address: string;
  latitude: number;
  longitude: number;
  is_active: boolean;
}