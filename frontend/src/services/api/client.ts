import { toast } from 'sonner';
import { ApiResponse, ApiError, ApiClientOptions } from './types';
import { getCookie, eraseCookie } from './cookies';
import { getIsRefreshing, setIsRefreshing, subscribeTokenRefresh, onRefreshed } from './refresh-state';

/**
 * Địa chỉ URL gốc của Backend REST API
 * Nạp từ biến môi trường NEXT_PUBLIC_API_URL (mặc định: http://localhost:8080/api/v1)
 */
export const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

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

  // 2. Thiết lập HTTP Headers mặc định (JSON format + Bearer JWT Token từ Cookie + Client Type header)
  const isFormData = options.body instanceof FormData;
  const headers: HeadersInit = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    'X-Client-Type': 'web',
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
          headers: { 'X-Client-Type': 'web' },
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
