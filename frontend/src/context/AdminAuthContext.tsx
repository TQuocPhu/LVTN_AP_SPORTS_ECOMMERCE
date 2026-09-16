"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { adminAuthController } from "@/controllers/admin-auth-controller";
import { AdminLoginRequest, ApiResponse, UserResponse } from "@/types/auth";

interface AdminAuthContextType {
  user: UserResponse | null;
  loading: boolean;
  error: string | null;
  login: (data: AdminLoginRequest) => Promise<ApiResponse<UserResponse>>;
  logout: () => Promise<void>;
  refetchAdmin: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType>({
  user: null,
  loading: true,
  error: null,
  login: async () => ({
    success: false,
    message: "",
    data: {} as UserResponse,
    timestamp: "",
  }),
  logout: async () => {},
  refetchAdmin: async () => {},
});

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const userRef = useRef<UserResponse | null>(null);

  useEffect(() => {
    userRef.current = user;
  }, [user]);

  const fetchCurrentAdmin = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await adminAuthController.getCurrentAdmin();
      if (res?.data && res.data.roleName !== 'CUSTOMER') {
        setUser(res.data);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCurrentAdmin();
  }, [fetchCurrentAdmin]);

  const login = async (data: AdminLoginRequest) => {
    try {
      setLoading(true);
      setError(null);
      const res = await adminAuthController.login(data);
      if (res?.data) {
        setUser(res.data);
      }
      return res;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Đăng nhập Admin thất bại";
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await adminAuthController.logout();
    } catch (err) {
      console.error("Lỗi đăng xuất admin:", err);
    } finally {
      setUser(null);
    }
  };

  return (
    <AdminAuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        logout,
        refetchAdmin: fetchCurrentAdmin,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  return useContext(AdminAuthContext);
}
