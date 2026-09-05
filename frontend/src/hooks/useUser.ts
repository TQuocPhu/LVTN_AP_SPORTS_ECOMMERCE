import { useState, useCallback } from 'react';
import { userController } from '@/controllers/user-controller';
import { UserCreateRequest, UserResponse } from '@/types/user';

export function useUser() {
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await userController.getAllUsers();
      setUsers(data);
    } catch (err: any) {
      setError(err.message || 'Lỗi tải người dùng');
    } finally {
      setLoading(false);
    }
  }, []);

  const createUser = async (payload: UserCreateRequest) => {
    setLoading(true);
    setError(null);
    try {
      const newUser = await userController.createUser(payload);
      setUsers((prev) => [...prev, newUser]);
      return newUser;
    } catch (err: any) {
      setError(err.message || 'Lỗi tạo người dùng');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { users, loading, error, loadUsers, createUser };
}
