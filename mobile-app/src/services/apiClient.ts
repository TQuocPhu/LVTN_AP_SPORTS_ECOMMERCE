import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_CONFIG } from '../config/api.config';
import { TokenResponse } from '../types';

export const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'X-Client-Type': API_CONFIG.CLIENT_TYPE,
    'Bypass-Tunnel-Reminder': 'true',
  },
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else if (token) {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// 1. Request Interceptor: Tự động đính kèm Bearer Token từ SecureStore
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      const accessToken = await SecureStore.getItemAsync(
        API_CONFIG.STORAGE_KEYS.ACCESS_TOKEN
      );
      if (accessToken && config.headers) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
    } catch {
      // Bỏ qua lỗi đọc SecureStore nếu môi trường chưa sẵn sàng
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 2. Response Interceptor: Tự động Silent Refresh Token khi gặp lỗi 401
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = await SecureStore.getItemAsync(
          API_CONFIG.STORAGE_KEYS.REFRESH_TOKEN
        );

        if (!refreshToken) {
          processQueue(error, null);
          return Promise.reject(error);
        }

        // Gọi API refresh token riêng biệt không qua interceptor
        const res = await axios.post<{ data: TokenResponse }>(
          `${API_CONFIG.BASE_URL}/customer/auth/refresh`,
          { refreshToken },
          {
            headers: {
              'Content-Type': 'application/json',
              'X-Client-Type': API_CONFIG.CLIENT_TYPE,
            },
          }
        );

        const newTokens = res.data?.data;
        if (newTokens?.accessToken) {
          await SecureStore.setItemAsync(
            API_CONFIG.STORAGE_KEYS.ACCESS_TOKEN,
            newTokens.accessToken
          );
          if (newTokens.refreshToken) {
            await SecureStore.setItemAsync(
              API_CONFIG.STORAGE_KEYS.REFRESH_TOKEN,
              newTokens.refreshToken
            );
          }

          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newTokens.accessToken}`;
          }

          processQueue(null, newTokens.accessToken);
          return apiClient(originalRequest);
        }
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        // Xóa token hết hạn khỏi SecureStore
        await SecureStore.deleteItemAsync(API_CONFIG.STORAGE_KEYS.ACCESS_TOKEN);
        await SecureStore.deleteItemAsync(API_CONFIG.STORAGE_KEYS.REFRESH_TOKEN);
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
