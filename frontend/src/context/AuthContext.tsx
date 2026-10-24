"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { authController } from "@/controllers/auth-controller";
import {
  UserResponse,
  RegisterRequest,
  LoginRequest,
  ApiResponse,
} from "@/types/auth";

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
  register: async () => ({
    success: false,
    message: "",
    data: undefined as void,
    timestamp: "",
  }),
  activateAccount: async () => ({
    success: false,
    message: "",
    data: undefined as void,
    timestamp: "",
  }),
  login: async () => ({
    success: false,
    message: "",
    data: {} as UserResponse,
    timestamp: "",
  }),
  logout: async () => {},
  refetchUser: async () => {},
});

/**
 * AuthProvider – bọc toàn bộ app trong RootLayout.
 * Mọi component (Navbar, Profile, v.v.) dùng useAuth() sẽ đọc từ
 * cùng một state – tự động cập nhật ngay khi đăng nhập / đăng xuất.
 */
import { getCookie } from "@/services/api/cookies";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  // Theo dõi thời điểm cuối cùng gọi refresh để tránh gọi trùng lặp
  const lastRefreshAtRef = useRef<number>(0);
  // Ref lưu trạng thái user để dùng an toàn trong interval mà không gây re-render loop
  const userRef = useRef<UserResponse | null>(null);

  // Đồng bộ user state vào userRef
  useEffect(() => {
    userRef.current = user;
  }, [user]);

  // Lấy user hiện tại từ Cookie – chạy 1 lần khi app khởi động hoặc khi chủ động refetch
  const fetchCurrentUser = useCallback(async (isInitial = false) => {
    if (typeof window !== 'undefined' && window.location.pathname.startsWith('/demo')) {
      setLoading(false);
      return;
    }

    // Nếu trình duyệt chưa từng đăng nhập (khách vãng lai), không gọi /auth/me để tránh request 401 thừa
    if (typeof window !== 'undefined' && !localStorage.getItem("apsports_has_session")) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      if (isInitial) setLoading(true);
      setError(null);
      const res = await authController.getCurrentUser();
      if (res?.data && res.data.roleName === 'CUSTOMER') {
        setUser(res.data);
        if (typeof window !== 'undefined') {
          localStorage.setItem("apsports_has_session", "true");
        }
      } else {
        setUser(null);
        if (typeof window !== 'undefined') {
          localStorage.removeItem("apsports_has_session");
        }
      }
    } catch {
      setUser(null);
      if (typeof window !== 'undefined') {
        localStorage.removeItem("apsports_has_session");
      }
    } finally {
      if (isInitial) setLoading(false);
    }
  }, []);

  /**
   * Chủ động làm mới phiên ngầm định kỳ mỗi 20 phút trước khi Access Token 30 phút hết hạn.
   * CHỈ thực hiện khi người dùng ĐÃ ĐĂNG NHẬP.
   * TUYỆT ĐỐI không gọi khi chuyển tab (visibilitychange) để tránh gây gián đoạn phiên hoặc đăng xuất nhầm.
   */
  const proactiveRefresh = useCallback(async () => {
    // Không refresh nếu chưa đăng nhập (khách)
    if (!userRef.current) return;

    const now = Date.now();
    // Debounce: không refresh lại nếu vừa refresh trong vòng 60 giây
    if (now - lastRefreshAtRef.current < 60_000) return;
    lastRefreshAtRef.current = now;

    try {
      const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';
      const xsrfToken = getCookie("XSRF-TOKEN");
      const refreshRes = await fetch(`${BASE_URL}/customer/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'X-Client-Type': 'web',
          ...(xsrfToken ? { 'X-XSRF-TOKEN': xsrfToken } : {}),
        },
      });

      if (refreshRes.ok) {
        // Refresh thành công → cập nhật nhẹ nhàng không làm giật UI
        await fetchCurrentUser(false);
      } else if (refreshRes.status === 401) {
        // CHỈ đăng xuất khi Server trả về 401 xác nhận Refresh Token đã hết hạn / bị thu hồi
        setUser(null);
        if (typeof window !== 'undefined') {
          localStorage.removeItem("apsports_has_session");
        }
      }
    } catch {
      // Network error hoặc sự cố mạng tạm thời → GIỮ NGUYÊN trạng thái đăng nhập, không tự ý đăng xuất
    }
  }, [fetchCurrentUser]);

  useEffect(() => {
    // Khởi động: Chỉ fetch user 1 lần duy nhất qua /auth/me khi App Mount.
    fetchCurrentUser(true);

    // Chủ động refresh định kỳ mỗi 20 phút (trước khi Access Token 30 phút hết hạn)
    const intervalId = setInterval(() => {
      if (userRef.current) {
        proactiveRefresh();
      }
    }, 20 * 60 * 1000);

    return () => {
      clearInterval(intervalId);
    };
  }, [fetchCurrentUser, proactiveRefresh]);

  // Đăng ký
  const register = async (data: RegisterRequest) => {
    try {
      setLoading(true);
      setError(null);
      return await authController.register(data);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Đăng ký không thành công";
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
      const msg =
        err instanceof Error ? err.message : "Kích hoạt không thành công";
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
        if (typeof window !== "undefined") {
          localStorage.setItem("apsports_has_session", "true");
          window.dispatchEvent(new CustomEvent("auth:login"));
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

  // Đăng xuất – xóa user trong context ngay → Navbar re-render tức thì
  const logout = async () => {
    try {
      await authController.logout();
    } catch (err) {
      console.error("Lỗi đăng xuất:", err);
    } finally {
      setUser(null);
      if (typeof window !== "undefined") {
        localStorage.removeItem("apsports_has_session");
        window.dispatchEvent(new CustomEvent("auth:logout"));
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        register,
        activateAccount,
        login,
        logout,
        refetchUser: fetchCurrentUser,
      }}
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
