/**
 * Định nghĩa các kiểu dữ liệu TypeScript cho Phân hệ Quản lý Người dùng / Tài khoản (Admin User Management).
 */

export type UserRole = 'ADMIN' | 'STAFF' | 'WAREHOUSE_MANAGER' | 'CUSTOMER';
export type UserStatus = 'pending' | 'active' | 'banned' | 'deleted';

export interface ShippingAddress {
  id: number;
  fullName: string;
  phone: string;
  address: string;
  city: string;
  provinceId?: number;
  districtId?: number;
  wardCode?: string;
  isDefault: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserAccount {
  id: number;
  name: string;
  email: string;
  phoneNumber?: string;
  avatar?: string;
  address?: string;
  role: UserRole | string;
  status: UserStatus | string;
  employeeCode?: string;
  activationToken?: string;
  emailVerifiedAt?: string;
  createdAt?: string;
  updatedAt?: string;
  addresses?: ShippingAddress[];
}

export interface UserFilterParams {
  keyword?: string;
  role?: string; // ALL, ADMIN, STAFF, WAREHOUSE_MANAGER, CUSTOMER
  status?: string; // ALL, pending, active, banned, deleted
  sortBy?: 'createdAt' | 'name' | 'email' | 'role' | 'status';
  sortDir?: 'ASC' | 'DESC';
  page?: number;
  size?: number;
}

export interface CreateStaffFormData {
  name: string;
  email: string;
  phoneNumber?: string;
  role: 'STAFF' | 'WAREHOUSE_MANAGER' | string;
}

export interface UserPageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}
