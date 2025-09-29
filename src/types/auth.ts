// Authentication DTOs
export interface LoginRequest {
  userId: string;
  password: string;
  isBusiness: boolean;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: {
    id: string;
    userId: string;
    name: string;
    isBusiness?: boolean;
  };
}

export interface RegisterRequest {
  userId: string;
  email: string;
  password: string;
  phone: string;
  name: string;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: {
    id: string;
    userId: string;
    email: string;
    phone: string;
    name: string;
    isAdmin: boolean;
  };
}

// Form state types
export interface LoginFormData {
  userId: string;
  password: string;
}

export interface RegisterFormData {
  userId: string;
  email: string;
  password: string;
  phone: string;
  name: string; // For UI display only
}
