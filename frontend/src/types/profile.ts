/**
 * TypeScript Interfaces cho cụm tính năng Hồ sơ cá nhân Khách hàng (Customer Profile Module).
 */

export interface UserProfile {
  id: number;
  name: string;
  email: string;
  phoneNumber?: string;
  avatar?: string;
  address?: string;
  role: string;
  status: string;
  googleId?: string;
  googleAccount?: boolean;
  createdAt: string;
}

export interface UpdateProfileRequest {
  name?: string;
  phoneNumber?: string;
  address?: string;
}

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}
