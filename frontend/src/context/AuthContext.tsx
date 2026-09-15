'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authController } from '@/controllers/auth-controller';
import { UserResponse, RegisterRequest, LoginRequest, ApiResponse } from '@/types/auth';

/**
 * Shape của Auth Context – chia sẻ toàn app qua Provider
 */
interface AuthContextType {
  user: UserResponse | null;
  loading: boolean;
  error: string | null;
  register: (data: RegisterRequest) => Promise<ApiResponse<void>>;
  activateAccount: (token: string) => Promise<ApiResponse<void>>;
  login: (data: LoginRequest) => Promise<ApiResponse<UserResponse>>;
  logout: () => Promise<void>;
  refetchUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  error: null,
  register: async () => ({ success: false, message: '', data: undefined as void, timestamp: '' }),
  activateAccount: async () => ({ success: false, message: '', data: undefined as void, timestamp: '' }),
  login: async () => ({ success: false, message: '', data: {} as UserResponse, timestamp: '' }),
  logout: async () => {},
  refetchUser: async () => {},
});

/**
 * AuthProvider – bọc toàn bộ app trong RootLayout.
 * Mọi component (Navbar, Profile, v.v.) dùng useAuth() sẽ đọc từ
 * cùng một state – tự động cập nhật ngay khi đăng nhập / đăng xuất.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Lấy user hiện tại từ Cookie – chạy 1 lần khi app khởi động
  const fetchCurrentUser = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await authController.getCurrentUser();
      setUser(res?.data ?? null);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  // Đăng ký
  const register = async (data: RegisterRequest) => {
    try {
      setLoading(true);
      setError(null);
      return await authController.register(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Đăng ký không thành công';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Kích hoạt tài khoản
  const activateAccount = async (token: string) => {
    try {
      setLoading(true);
      setError(null);
      return await authController.activateAccount(token);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Kích hoạt không thành công';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Đăng nhập – cập nhật user ngay trong context → Navbar re-render tức thì
  const login = async (data: LoginRequest) => {
    try {
      setLoading(true);
      setError(null);
      const res = await authController.login(data);
      if (res?.data) {
        setUser(res.data);
      }
      return res;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Đăng nhập thất bại';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Đăng xuất – xóa user trong context ngay → Navbar re-render tức thì
  const logout = async () => {
    try {
      await authController.logout();
    } catch (err) {
      console.error('Lỗi đăng xuất:', err);
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, error, register, activateAccount, login, logout, refetchUser: fetchCurrentUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook lấy Auth Context – dùng thay thế hoàn toàn useAuth cũ.
 * Mọi component gọi useAuth() đều nhận state chung từ AuthProvider.
 */
export function useAuthContext() {
  return useContext(AuthContext);
}
