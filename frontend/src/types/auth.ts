/**
 * TypeScript Interfaces cho cụm tính năng Xác thực Khách hàng (Customer Auth Module).
 */

export interface UserResponse {
  id: number;
  name: string;
  email: string;
  status: 'pending' | 'active' | 'banned' | 'deleted';
  phoneNumber?: string;
  avatar?: string;
  address?: string;
  roleName: string;
  emailVerifiedAt?: string;
  createdAt: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface ApiResponse<T = void> {
  success?: boolean;
  status?: number;
  message: string;
  data: T;
  timestamp: string;
}
