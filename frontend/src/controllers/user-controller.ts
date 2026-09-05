import { ApiResponse } from '@/types/api';
import { UserCreateRequest, UserResponse } from '@/types/user';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

export const userController = {
  async getAllUsers(): Promise<UserResponse[]> {
    const res = await fetch(`${API_BASE}/v1/users`, { cache: 'no-store' });
    const result: ApiResponse<UserResponse[]> = await res.json();
    if (!res.ok || !result.success) {
      throw new Error(result.message || 'Không thể lấy danh sách người dùng');
    }
    return result.data;
  },

  async createUser(payload: UserCreateRequest): Promise<UserResponse> {
    const res = await fetch(`${API_BASE}/v1/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const result: ApiResponse<UserResponse> = await res.json();
    if (!res.ok || !result.success) {
      const errDetail = result.errors ? JSON.stringify(result.errors) : '';
      throw new Error(`${result.message} ${errDetail}`);
    }
    return result.data;
  },
};
