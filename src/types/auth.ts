// types/auth.ts
export interface User {
  id: string;
  userId: string;
  name: string;
  email: string | null;
  phone: string | null;
  isAdmin: boolean;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user: User;
  token: string;
  refreshToken?: string;
}

export interface LoginDto {
  userId: string;
  password: string;
}

export interface LoginByEmailDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  userId: string;
  name: string;
  email: string;
  password: string;
  phone: string;
}

export interface UpdatePasswordDto {
  currentPassword: string;
  newPassword: string;
}

export interface UpdatePhoneDto {
  phone: string;
}

export interface UpdateEmailDto {
  email: string;
}

export interface UpdateNameDto {
  name: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  user?: User;
}