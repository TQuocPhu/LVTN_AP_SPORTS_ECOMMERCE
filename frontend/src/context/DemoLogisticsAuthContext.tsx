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

  useEffect(() => {
    userRef.current = user;
  }, [user]);

  const fetchCurrentUser = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await demoLogisticsAuthController.getCurrentUser();
      if (res?.data && (res.data.roleName === 'GHN_STATION' || res.data.roleName === 'GHN_SHIPPER')) {
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
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  const login = async (data: AdminLoginRequest) => {
    try {
      setLoading(true);
      setError(null);
      const res = await demoLogisticsAuthController.login(data);
      if (res?.data) {
        setUser(res.data);
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
