import { RequestInit } from 'next/dist/compiled/@edge-runtime/primitives';

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
 * Custom Error Class cho các phản hồi lỗi từ REST API
 */
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

/**
 * Type Guard kiểm tra một ngoại lệ có phải là ApiError hay không
 */
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
 * Cấu hình tùy chọn cho apiClient wrapper
 */
export interface ApiClientOptions extends globalThis.RequestInit {
  showSuccessToast?: boolean;
  suppressErrorToast?: boolean;
  timeoutMs?: number;
}
