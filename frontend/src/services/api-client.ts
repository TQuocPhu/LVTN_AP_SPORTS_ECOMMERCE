/**
 * Địa chỉ URL gốc của Backend REST API
 * Nạp từ biến môi trường NEXT_PUBLIC_API_URL (mặc định: http://localhost:8080/api/v1)
 */
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

/**
 * Structure chuẩn hóa phản hồi từ Backend Spring Boot
 * Đóng gói bao gồm: trạng thái thành công, thông điệp, dữ liệu payload và thời gian
 */
export interface ApiResponse<T> {
  success: boolean;
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
  document.cookie = `${name}=${value || ''}${expires}; path=/; SameSite=Lax; Secure`;
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
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
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
  const response = await fetch(`${BASE_URL}${endpoint}`, config);

  // 5. Xử lý khi HTTP Status không thành công (Status 4xx, 5xx)
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP Error ${response.status}`);
  }

  // 6. Trả về kết quả JSON đã đóng gói chuẩn ApiResponse<T>
  return response.json();
}
