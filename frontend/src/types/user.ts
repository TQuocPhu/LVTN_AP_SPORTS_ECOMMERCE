export interface UserResponse {
  id: number;
  username: string;
  email: string;
  fullName: string;
  role: 'ROLE_USER' | 'ROLE_ADMIN' | 'ROLE_MANAGER';
  status: 'ACTIVE' | 'INACTIVE' | 'BLOCKED';
  createdAt: string;
}

export interface UserCreateRequest {
  username: string;
  email: string;
  password: string;
  fullName: string;
}
