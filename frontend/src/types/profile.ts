export interface UserProfile {
  id: number;
  name: string;
  email: string;
  phoneNumber?: string;
  avatar?: string;
  address?: string;
  role: string;
  status: string;
  createdAt: string;
}

export interface UpdateProfileRequest {
  name: string;
  phoneNumber?: string;
  address?: string;
}

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}
