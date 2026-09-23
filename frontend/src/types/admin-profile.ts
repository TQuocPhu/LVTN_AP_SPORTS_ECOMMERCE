import { UserResponse } from './auth';

export type AdminProfile = UserResponse;

export interface UpdateAdminProfileRequest {
  name: string;
  phoneNumber?: string;
  address?: string;
}

export interface ChangeAdminPasswordRequest {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}
