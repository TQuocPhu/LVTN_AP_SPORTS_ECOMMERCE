/**
 * Main Entrypoint của API Client Service
 * 
 * Re-export toàn bộ các sub-modules từ `@/services/api/*`:
 * - `./api/types`: ApiResponse, ApiError, isApiError, ApiClientOptions
 * - `./api/cookies`: getCookie, setCookie, eraseCookie
 * - `./api/refresh-state`: getIsRefreshing, setIsRefreshing, subscribeTokenRefresh, onRefreshed
 * - `./api/client`: apiClient, BASE_URL
 * 
 * Đảm bảo 100% tính tương thích ngược (Backward Compatibility) với các file đang import từ `@/services/api-client`.
 */

export * from './api/types';
export * from './api/cookies';
export * from './api/refresh-state';
export * from './api/client';
