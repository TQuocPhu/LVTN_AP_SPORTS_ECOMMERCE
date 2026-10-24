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
  CustomerLoginResponse,
  RegisterRequest,
  LoginRequest,
  ApiResponse,
} from "@/types/auth";
import { getCookie, setCookie, eraseCookie } from "@/services/api/cookies";

/**
 * Shape của Auth Context – chia sẻ toàn app qua Provider
 */
interface AuthContextType {
  user: UserResponse | null;
  loading: boolean;
  error: string | null;
  register: (data: RegisterRequest) => Promise<ApiResponse<void>>;
  activateAccount: (token: string) => Promise<ApiResponse<void>>;
  login: (data: LoginRequest) => Promise<ApiResponse<CustomerLoginResponse | UserResponse>>;
  loginWithGoogle: (idToken: string) => Promise<ApiResponse<CustomerLoginResponse | UserResponse>>;
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
  loginWithGoogle: async () => ({
    success: false,
    message: "",
    data: {} as UserResponse,
    timestamp: "",
  }),
  logout: async () => {},
  refetchUser: async () => {},
});

/**
 * Hàm tiện ích bóc tách chuẩn UserResponse từ payload trả về của API `/login` và `/google`
 * (Vì Backend trả về `CustomerLoginResponse { user: UserResponse }`).
 */
function extractUserFromLoginData(
  data: CustomerLoginResponse | UserResponse | undefined | null
): UserResponse | null {
  if (!data) return null;
  if ("user" in data && data.user) {
    return data.user;
  }
  return data as UserResponse;
}

/**
 * Đồng bộ cờ phiên trên cả localStorage và Cookie (để Next.js Edge Proxy nhận diện chính xác).
 */
function markClientSessionActive() {
  if (typeof window !== "undefined") {
    localStorage.setItem("apsports_has_session", "true");
    setCookie("apsports_has_session", "true", 7);
  }
}

function clearClientSessionFlags() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("apsports_has_session");
    eraseCookie("apsports_has_session");
    eraseCookie("accessToken");
    eraseCookie("refreshToken");
  }
}

/**
 * AuthProvider – bọc toàn bộ app trong RootLayout.
 * Mọi component (Navbar, Profile, v.v.) dùng useAuth() sẽ đọc từ
 * cùng một state – tự động cập nhật ngay khi đăng nhập / đăng xuất.
 */
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
    if (typeof window !== "undefined" && window.location.pathname.startsWith("/demo")) {
      setLoading(false);
      return;
    }

    // Nếu trình duyệt chưa từng đăng nhập (khách vãng lai), không gọi /auth/me để tránh request 401 thừa
    if (typeof window !== "undefined" && !localStorage.getItem("apsports_has_session")) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      if (isInitial) setLoading(true);
      setError(null);
      const res = await authController.getCurrentUser();
      if (res?.data && res.data.roleName === "CUSTOMER") {
        setUser(res.data);
        markClientSessionActive();
      } else {
        setUser(null);
        clearClientSessionFlags();
      }
    } catch {
      setUser(null);
      clearClientSessionFlags();
    } finally {
      if (isInitial) setLoading(false);
    }
  }, []);

  /**
   * Chủ động làm mới phiên ngầm định kỳ mỗi 20 phút trước khi Access Token 30 phút hết hạn.
   * CHỈ thực hiện khi người dùng ĐÃ ĐĂNG NHẬP.
   */
  const proactiveRefresh = useCallback(async () => {
    if (!userRef.current) return;

    const now = Date.now();
    if (now - lastRefreshAtRef.current < 60_000) return;
    lastRefreshAtRef.current = now;

    try {
      const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";
      const xsrfToken = getCookie("XSRF-TOKEN");
      const refreshRes = await fetch(`${BASE_URL}/customer/auth/refresh`, {
        method: "POST",
        credentials: "include",
        headers: {
          "X-Client-Type": "web",
          ...(xsrfToken ? { "X-XSRF-TOKEN": xsrfToken } : {}),
        },
      });

      if (refreshRes.ok) {
        await fetchCurrentUser(false);
      } else if (refreshRes.status === 401) {
        setUser(null);
        clearClientSessionFlags();
      }
    } catch {
      // Network error tạm thời -> giữ nguyên trạng thái đăng nhập
    }
  }, [fetchCurrentUser]);

  useEffect(() => {
    fetchCurrentUser(true);

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
      const msg = err instanceof Error ? err.message : "Đăng ký không thành công";
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
      const msg = err instanceof Error ? err.message : "Kích hoạt không thành công";
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Đăng nhập truyền thống – cập nhật user ngay trong context → Navbar re-render tức thì
  const login = async (data: LoginRequest) => {
    try {
      setLoading(true);
      setError(null);
      const res = await authController.login(data);
      const extractedUser = extractUserFromLoginData(res?.data);
      if (extractedUser) {
        setUser(extractedUser);
        markClientSessionActive();
        if (typeof window !== "undefined") {
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

  // Đăng nhập bằng Google OAuth2 (GIS idToken) – cập nhật user ngay trong context
  const loginWithGoogle = async (idToken: string) => {
    try {
      setLoading(true);
      setError(null);
      const res = await authController.loginWithGoogle(idToken);
      const extractedUser = extractUserFromLoginData(res?.data);
      if (extractedUser) {
        setUser(extractedUser);
        markClientSessionActive();
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("auth:login"));
        }
      }
      return res;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Đăng nhập bằng Google thất bại";
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Đăng xuất – xóa user & ngắt phiên Google GIS ngay lập tức, đồng thời xóa sạch HttpOnly Cookies
  const logout = async () => {
    // 1. Vô hiệu hóa tự động chọn tài khoản của Google Identity Services (nếu có)
    if (typeof window !== "undefined") {
      try {
        const googleIdApi = (
          window as unknown as {
            google?: { accounts?: { id?: { disableAutoSelect?: () => void } } };
          }
        ).google?.accounts?.id;
        googleIdApi?.disableAutoSelect?.();
      } catch {
        // Bỏ qua nếu script GIS chưa nạp
      }
    }

    // 2. Xóa trạng thái user và cờ phiên ở Client ngay lập tức
    setUser(null);
    clearClientSessionFlags();
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("auth:logout"));
    }

    // 3. Gọi song song API Backend (thu hồi RefreshToken trong DB) và Next.js Route (đảm bảo xóa 100% HttpOnly Cookies)
    await Promise.allSettled([
      authController.logout(),
      typeof window !== "undefined"
        ? fetch("/api/auth/clear-cookies", { method: "POST", credentials: "include" })
        : Promise.resolve(),
    ]);
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
        loginWithGoogle,
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
