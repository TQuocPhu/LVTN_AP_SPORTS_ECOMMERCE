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
  const lastRefreshAtRef = useRef<number>(0);

  useEffect(() => {
    userRef.current = user;
  }, [user]);

  const fetchCurrentAdmin = useCallback(async (isInitial = false) => {
    // Nếu chưa từng đăng nhập admin trên trình duyệt này, bỏ qua để tránh gọi /admin/auth/me trả về 401 thừa
    if (typeof window !== 'undefined' && !localStorage.getItem("apsports_admin_has_session")) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      if (isInitial) setLoading(true);
      setError(null);
      const res = await adminAuthController.getCurrentAdmin();
      if (res?.data && res.data.roleName !== 'CUSTOMER') {
        setUser(res.data);
        if (typeof window !== 'undefined') {
          localStorage.setItem("apsports_admin_has_session", "true");
        }
      } else {
        setUser(null);
        if (typeof window !== 'undefined') {
          localStorage.removeItem("apsports_admin_has_session");
        }
      }
    } catch {
      setUser(null);
      if (typeof window !== 'undefined') {
        localStorage.removeItem("apsports_admin_has_session");
      }
    } finally {
      if (isInitial) setLoading(false);
    }
  }, []);

  /**
   * Làm mới phiên Admin ngầm định kỳ mỗi 20 phút trước khi token 30 phút hết hạn.
   * Sử dụng adminAuthController.refreshToken() đã tích hợp sẵn apiClient (tự động đính kèm CSRF và HttpOnly cookies).
   */
  const proactiveRefresh = useCallback(async () => {
    if (!userRef.current) return;

    const now = Date.now();
    if (now - lastRefreshAtRef.current < 60_000) return;
    lastRefreshAtRef.current = now;

    try {
      await adminAuthController.refreshToken();
      await fetchCurrentAdmin(false);
    } catch {
      // Giữ nguyên phiên làm việc nếu gặp lỗi mạng tạm thời
    }
  }, [fetchCurrentAdmin]);

  useEffect(() => {
    fetchCurrentAdmin(true);

    const intervalId = setInterval(() => {
      if (userRef.current) {
        proactiveRefresh();
      }
    }, 20 * 60 * 1000);

    return () => clearInterval(intervalId);
  }, [fetchCurrentAdmin, proactiveRefresh]);

  const login = async (data: AdminLoginRequest) => {
    try {
      setLoading(true);
      setError(null);
      const res = await adminAuthController.login(data);
      if (res?.data) {
        setUser(res.data);
        if (typeof window !== "undefined") {
          localStorage.setItem("apsports_admin_has_session", "true");
          window.dispatchEvent(new CustomEvent("auth:login"));
        }
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
      if (typeof window !== "undefined") {
        localStorage.removeItem("apsports_admin_has_session");
        window.dispatchEvent(new CustomEvent("auth:logout"));
      }
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
