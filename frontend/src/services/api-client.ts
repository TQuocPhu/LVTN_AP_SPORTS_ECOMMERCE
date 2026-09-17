import { toast } from 'sonner';

/**
 * Địa chỉ URL gốc của Backend REST API
 * Nạp từ biến môi trường NEXT_PUBLIC_API_URL (mặc định: http://localhost:8080/api/v1)
 */
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

/**
 * Structure chuẩn hóa phản hồi từ Backend Spring Boot
 * Đóng gói bao gồm: trạng thái thành công, thông điệp, dữ liệu payload và thời gian
 */
export interface ApiResponse<T = void> {
  success?: boolean;
  status?: number;
  message: string;
  data: T;
  timestamp: string;
}

/**
 * Hàm đọc Cookie an toàn trên phía Client trình duyệt
 * (TUYỆT ĐỐI KHÔNG DÙNG localStorage THEO QUY TẮC BẢO MẬT DỰ ÁN)
 * 
 * @param {string} name - Tên của Cookie cần đọc (Ví dụ: 'accessToken')
 * @returns {string | null} Giá trị của Cookie hoặc null nếu không tìm thấy
 */
export function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
}

/**
 * Hàm ghi Cookie phía Client trình duyệt với thời hạn sinh sống (Expiration)
 * 
 * @param {string} name - Tên Cookie
 * @param {string} value - Giá trị Cookie
 * @param {number} days - Số ngày tồn tại
 */
export function setCookie(name: string, value: string, days: number = 7): void {
  if (typeof document === 'undefined') return;
  const date = new Date();
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
  const expires = `; expires=${date.toUTCString()}`;
  const secureFlag = typeof window !== 'undefined' && window.location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${name}=${value || ''}${expires}; path=/; SameSite=Lax${secureFlag}`;
}

/**
 * Hàm xóa Cookie phía Client
 * 
 * @param {string} name - Tên Cookie cần xóa
 */
export function eraseCookie(name: string): void {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
}

export class ApiError extends Error {
  status: number;
  fieldErrors?: Record<string, string>;
  isApiError: boolean = true;

  constructor(message: string, status: number = 400, fieldErrors?: Record<string, string>) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.fieldErrors = fieldErrors;
    this.isApiError = true;
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

export function isApiError(err: unknown): err is ApiError {
  if (!err || typeof err !== 'object') return false;
  if (err instanceof ApiError) return true;
  const obj = err as Record<string, unknown>;
  return (
    obj.name === 'ApiError' ||
    obj.isApiError === true ||
    ('fieldErrors' in obj && typeof obj.status === 'number')
  );
}

/**
 * State quản lý silent refresh được lưu trên window thay vì module-level variable.
 * Lý do: Trong dev mode, Next.js HMR re-evaluate module nhiều lần khi có thay đổi,
 * khiến biến module bị reset về giá trị khởi tạo trong khi request đang chạy.
 * Lưu trên window giúp state tồn tại qua các HMR reload → không bị race condition.
 */
declare global {
  interface Window {
    __apiIsRefreshing__: boolean;
    __apiRefreshSubscribers__: ((success: boolean) => void)[];
  }
}

function getIsRefreshing(): boolean {
  if (typeof window === 'undefined') return false;
  return window.__apiIsRefreshing__ ?? false;
}

function setIsRefreshing(value: boolean): void {
  if (typeof window === 'undefined') return;
  window.__apiIsRefreshing__ = value;
}

function getRefreshSubscribers(): ((success: boolean) => void)[] {
  if (typeof window === 'undefined') return [];
  if (!Array.isArray(window.__apiRefreshSubscribers__)) {
    window.__apiRefreshSubscribers__ = [];
  }
  return window.__apiRefreshSubscribers__;
}

function subscribeTokenRefresh(): Promise<boolean> {
  return new Promise((resolve) => {
    // Safety timeout (10s) để ngăn đơ/treo trang UI trong mọi trường hợp
    const timer = setTimeout(() => {
      resolve(false);
    }, 10000);

    getRefreshSubscribers().push((success: boolean) => {
      clearTimeout(timer);
      resolve(success);
    });
  });
}

function onRefreshed(success: boolean) {
  const subscribers = getRefreshSubscribers();
  subscribers.forEach((cb) => cb(success));
  if (typeof window !== 'undefined') {
    window.__apiRefreshSubscribers__ = [];
  }
}

export interface ApiClientOptions extends RequestInit {
  showSuccessToast?: boolean;
  suppressErrorToast?: boolean;
  timeoutMs?: number;
}

/**
 * Hàm gọi API chung (Base API Client Wrapper) sử dụng fetch API
 * 
 * @template T - Kiểu dữ liệu nhận về trong trường `data` của ApiResponse
 * @param {string} endpoint - Đường dẫn API (Ví dụ: '/auth/login', '/products')
 * @param {ApiClientOptions} options - Cấu hình tùy chọn cho fetch (method, body, headers...)
 * @param {boolean} isRetry - Tránh lặp vô tận (Infinite loop) khi retry request
 * @returns {Promise<ApiResponse<T>>} Phản hồi chuẩn hóa từ server
 */
export async function apiClient<T>(
  endpoint: string,
  options: ApiClientOptions = {},
  isRetry: boolean = false
): Promise<ApiResponse<T>> {
  // 1. Tự động lấy Access Token từ COOKIE nếu có (ví dụ môi trường không HttpOnly)
  const token = getCookie('accessToken');

  // 2. Thiết lập HTTP Headers mặc định (JSON format + Bearer JWT Token từ Cookie nếu có)
  const isFormData = options.body instanceof FormData;
  const headers: HeadersInit = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  // 3. Tự động ngắt request (Abort) sau timeout (Mặc định: 30s, hoặc truyền qua options)
  const timeoutMs = options.timeoutMs ?? 30000;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  const config: RequestInit = {
    credentials: 'include',
    signal: options.signal || controller.signal,
    ...options,
    headers,
  };

  // 4. Thực thi request đến Spring Boot Backend có timeout bảo vệ
  let response: Response;
  try {
    response = await fetch(`${BASE_URL}${endpoint}`, config);
  } catch (err: unknown) {
    if (err instanceof Error && err.name === 'AbortError') {
      throw new Error('Kết nối máy chủ Backend quá thời gian quy định (Timeout).');
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }

  // 5. Xử lý khi HTTP Status 401 Unauthorized -> Thực hiện Silent Refresh tự động
  // Luồng đúng:
  //   - AT còn hạn → 200 OK ngay, 0 overhead
  //   - AT hết hạn (30 phút) → 401 → silent refresh → new AT → retry → user vẫn login 
  //   - Khách / Incognito (không có RT) → /auth/refresh cũng 401 → onRefreshed(false) → user=null 
  if (
    response.status === 401 &&
    !isRetry &&
    !endpoint.includes('/auth/login') &&
    !endpoint.includes('/auth/refresh') &&
    !endpoint.includes('/auth/logout')
  ) {
    if (!getIsRefreshing()) {
      setIsRefreshing(true);
      try {
        const refreshRes = await fetch(`${BASE_URL}/customer/auth/refresh`, {
          method: 'POST',
          credentials: 'include',
        });
        if (refreshRes.ok) {
          onRefreshed(true);
          // Retry request ban đầu với HttpOnly cookie mới tự động đính kèm qua credentials: 'include'
          response = await fetch(`${BASE_URL}${endpoint}`, { ...config, headers });
        } else {
          onRefreshed(false);
          eraseCookie('accessToken');
          eraseCookie('refreshToken');
          if (typeof window !== 'undefined' && !endpoint.includes('/auth/me')) {
            const isProtectedRoute = ['/profile', '/account', '/orders', '/checkout'].some((p) =>
              window.location.pathname.startsWith(p)
            );
            if (isProtectedRoute) {
              window.location.href = `/login?reason=session_expired&callbackUrl=${encodeURIComponent(window.location.pathname)}`;
            }
          }
        }
      } catch {
        onRefreshed(false);
        eraseCookie('accessToken');
        eraseCookie('refreshToken');
      } finally {
        setIsRefreshing(false);
      }
    } else {
      // Đợi request refresh token đang diễn ra hoàn thành
      const succeeded = await subscribeTokenRefresh();
      if (succeeded) {
        response = await fetch(`${BASE_URL}${endpoint}`, { ...config, headers });
      }
    }
  }

  // 6. Xử lý khi HTTP Status không thành công (Status 4xx, 5xx)
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMessage = errorData.message || `Lỗi phản hồi hệ thống (${response.status})`;
    const fieldErrors: Record<string, string> | undefined =
      errorData.data && typeof errorData.data === 'object' && !Array.isArray(errorData.data)
        ? (errorData.data as Record<string, string>)
        : undefined;

    const shouldSuppressError =
      (options as ApiClientOptions).suppressErrorToast ??
      (endpoint.includes('/auth/me') || endpoint.includes('/auth/refresh') || response.status === 401);

    let displayMessage = errorMessage;
    if (fieldErrors && Object.keys(fieldErrors).length > 0) {
      const details = Array.from(new Set(Object.values(fieldErrors))).join('; ');
      displayMessage = `${errorMessage}: ${details}`;
    }

    if (typeof window !== 'undefined' && !shouldSuppressError) {
      toast.error(displayMessage);
    }
    throw new ApiError(displayMessage, response.status, fieldErrors);
  }

  // 7. Trả về kết quả JSON đã đóng gói chuẩn ApiResponse<T>
  const data: ApiResponse<T> = await response.json();

  // 8. Tự động hiển thị Toast thành công ở góc trên bên phải cho các phương thức POST, PUT, DELETE, PATCH hoặc khi được yêu cầu
  const method = (options.method || 'GET').toUpperCase();
  const shouldShowSuccess = (options as ApiClientOptions).showSuccessToast ?? (method !== 'GET');

  if (shouldShowSuccess && data.message && typeof window !== 'undefined') {
    toast.success(data.message);
  }

  return data;
}

// (ApiClientOptions đã được khai báo ở trên dòng 141 — xóa khai báo trùng lặp này)

/**
 * Mở rộng các hàm tiện ích HTTP Methods (get, post, put, delete) cho apiClient
 */
apiClient.get = async <T>(endpoint: string, options: ApiClientOptions = {}): Promise<T> => {
  const res = await apiClient<unknown>(endpoint, { ...options, method: 'GET' });
  return res as unknown as T;
};

apiClient.post = async <T>(endpoint: string, data?: unknown, options: ApiClientOptions = {}): Promise<T> => {
  const res = await apiClient<unknown>(endpoint, {
    ...options,
    method: 'POST',
    body: data ? JSON.stringify(data) : undefined,
  });
  return res as unknown as T;
};

apiClient.put = async <T>(endpoint: string, data?: unknown, options: ApiClientOptions = {}): Promise<T> => {
  const res = await apiClient<unknown>(endpoint, {
    ...options,
    method: 'PUT',
    body: data ? JSON.stringify(data) : undefined,
  });
  return res as unknown as T;
};

apiClient.delete = async <T>(endpoint: string, options: ApiClientOptions = {}): Promise<T> => {
  const res = await apiClient<unknown>(endpoint, { ...options, method: 'DELETE' });
  return res as unknown as T;
};

