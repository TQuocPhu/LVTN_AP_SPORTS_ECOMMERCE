"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { demoLogisticsAuthController } from "@/controllers/demo-logistics-auth-controller";
import { AdminLoginRequest, ApiResponse, UserResponse } from "@/types/auth";

interface DemoLogisticsAuthContextType {
  user: UserResponse | null;
  loading: boolean;
  error: string | null;
  login: (data: AdminLoginRequest) => Promise<ApiResponse<UserResponse>>;
  logout: () => Promise<void>;
  refetchUser: () => Promise<void>;
}

const DemoLogisticsAuthContext = createContext<DemoLogisticsAuthContextType>({
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
  refetchUser: async () => {},
});

export function DemoLogisticsAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const userRef = useRef<UserResponse | null>(null);
  const lastRefreshAtRef = useRef<number>(0);

  useEffect(() => {
    userRef.current = user;
  }, [user]);

  const fetchCurrentUser = useCallback(async (isInitial = false) => {
    // Nếu chưa từng đăng nhập logistics trên trình duyệt này, bỏ qua để tránh gọi /demo/logistics/auth/me trả về 401 thừa
    if (typeof window !== 'undefined' && !localStorage.getItem("apsports_logistics_has_session")) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      if (isInitial) setLoading(true);
      setError(null);
      const res = await demoLogisticsAuthController.getCurrentUser();
      if (res?.data && (res.data.roleName === 'GHN_STATION' || res.data.roleName === 'GHN_SHIPPER')) {
        setUser(res.data);
        if (typeof window !== 'undefined') {
          localStorage.setItem("apsports_logistics_has_session", "true");
        }
      } else {
        setUser(null);
        if (typeof window !== 'undefined') {
          localStorage.removeItem("apsports_logistics_has_session");
        }
      }
    } catch {
      setUser(null);
      if (typeof window !== 'undefined') {
        localStorage.removeItem("apsports_logistics_has_session");
      }
    } finally {
      if (isInitial) setLoading(false);
    }
  }, []);

  /**
   * Làm mới phiên Logistics ngầm định kỳ mỗi 20 phút trước khi token 30 phút hết hạn.
   * Sử dụng demoLogisticsAuthController.refreshToken() đã tích hợp sẵn apiClient.
   */
  const proactiveRefresh = useCallback(async () => {
    if (!userRef.current) return;

    const now = Date.now();
    if (now - lastRefreshAtRef.current < 60_000) return;
    lastRefreshAtRef.current = now;

    try {
      await demoLogisticsAuthController.refreshToken();
      await fetchCurrentUser(false);
    } catch {
      // Giữ nguyên phiên nếu có lỗi mạng tạm thời
    }
  }, [fetchCurrentUser]);

  useEffect(() => {
    fetchCurrentUser(true);

    const intervalId = setInterval(() => {
      if (userRef.current) {
        proactiveRefresh();
      }
    }, 20 * 60 * 1000);

    return () => clearInterval(intervalId);
  }, [fetchCurrentUser, proactiveRefresh]);

  const login = async (data: AdminLoginRequest) => {
    try {
      setLoading(true);
      setError(null);
      const res = await demoLogisticsAuthController.login(data);
      if (res?.data) {
        setUser(res.data);
        if (typeof window !== "undefined") {
          localStorage.setItem("apsports_logistics_has_session", "true");
        }
      }
      return res;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Đăng nhập thất bại";
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await demoLogisticsAuthController.logout();
    } catch (err) {
      console.error("Lỗi đăng xuất logistics:", err);
    } finally {
      setUser(null);
      if (typeof window !== "undefined") {
        localStorage.removeItem("apsports_logistics_has_session");
      }
    }
  };

  return (
    <DemoLogisticsAuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        logout,
        refetchUser: fetchCurrentUser,
      }}
    >
      {children}
    </DemoLogisticsAuthContext.Provider>
  );
}

export function useDemoLogisticsAuth() {
  return useContext(DemoLogisticsAuthContext);
}
