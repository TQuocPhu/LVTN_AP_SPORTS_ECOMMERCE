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

let isRefreshing = false;
let refreshSubscribers: ((token: string | null) => void)[] = [];

function subscribeTokenRefresh(cb: (token: string | null) => void) {
  refreshSubscribers.push(cb);
}

function onRefreshed(newToken: string | null) {
  refreshSubscribers.forEach((cb) => cb(newToken));
  refreshSubscribers = [];
}

/**
 * Hàm gọi API chung (Base API Client Wrapper) sử dụng fetch API
 * 
 * @template T - Kiểu dữ liệu nhận về trong trường `data` của ApiResponse
 * @param {string} endpoint - Đường dẫn API (Ví dụ: '/auth/login', '/products')
 * @param {RequestInit} options - Cấu hình tùy chọn cho fetch (method, body, headers...)
 * @returns {Promise<ApiResponse<T>>} Phản hồi chuẩn hóa từ server
 */
export async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  // 1. Tự động lấy Access Token từ COOKIE (TUYỆT ĐỐI KHÔNG DÙNG localStorage)
  const token = getCookie('accessToken');

  // 2. Thiết lập HTTP Headers mặc định (JSON format + Bearer JWT Token từ Cookie nếu có)
  const isFormData = options.body instanceof FormData;
  const headers: HeadersInit = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  // 3. Đóng gói cấu hình request (bật credentials: 'include' để truyền Cookie tự động sang Backend)
  const config: RequestInit = {
    credentials: 'include',
    ...options,
    headers,
  };

  // 4. Thực thi request đến Spring Boot Backend
  let response = await fetch(`${BASE_URL}${endpoint}`, config);

  // 5. Xử lý khi HTTP Status 401 Unauthorized -> Thực hiện Silent Refresh tự động
  if (
    response.status === 401 &&
    !endpoint.includes('/auth/login') &&
    !endpoint.includes('/auth/refresh') &&
    !endpoint.includes('/auth/logout')
  ) {
    if (!isRefreshing) {
      isRefreshing = true;
      try {
        const refreshRes = await fetch(`${BASE_URL}/customer/auth/refresh`, {
          method: 'POST',
          credentials: 'include',
        });
        if (refreshRes.ok) {
          const newToken = getCookie('accessToken');
          isRefreshing = false;
          onRefreshed(newToken);
          const updatedHeaders: HeadersInit = {
            ...headers,
            ...(newToken ? { Authorization: `Bearer ${newToken}` } : {}),
          };
          response = await fetch(`${BASE_URL}${endpoint}`, { ...config, headers: updatedHeaders });
        } else {
          isRefreshing = false;
          onRefreshed(null);
          eraseCookie('accessToken');
        }
      } catch {
        isRefreshing = false;
        onRefreshed(null);
        eraseCookie('accessToken');
      }
    } else {
      const newToken = await new Promise<string | null>((resolve) => {
        subscribeTokenRefresh((t) => resolve(t));
      });
      if (newToken) {
        const updatedHeaders: HeadersInit = {
          ...headers,
          Authorization: `Bearer ${newToken}`,
        };
        response = await fetch(`${BASE_URL}${endpoint}`, { ...config, headers: updatedHeaders });
      }
    }
  }

  // 6. Xử lý khi HTTP Status không thành công (Status 4xx, 5xx)
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMessage = errorData.message || `Lỗi phản hồi hệ thống (${response.status})`;
    const shouldSuppressError =
      (options as ApiClientOptions).suppressErrorToast ??
      (endpoint.includes('/auth/me') || endpoint.includes('/auth/refresh'));

    if (typeof window !== 'undefined' && !shouldSuppressError) {
      toast.error(errorMessage);
    }
    throw new Error(errorMessage);
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

export interface ApiClientOptions extends RequestInit {
  showSuccessToast?: boolean;
  suppressErrorToast?: boolean;
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

