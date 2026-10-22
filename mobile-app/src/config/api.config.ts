import { Platform } from 'react-native';

/**
 * Cấu hình kết nối API Server Backend AP Sports (Spring Boot).
 * - Nạp tự động từ file .env qua biến EXPO_PUBLIC_LOCAL_IP, EXPO_PUBLIC_TUNNEL_URL
 * - Khi đổi mạng Wi-Fi: Bạn chỉ cần sửa IP trong mobile-app/.env cực kỳ tiện lợi.
 */
const TUNNEL_URL = process.env.EXPO_PUBLIC_TUNNEL_URL || '';
const LOCAL_IP = process.env.EXPO_PUBLIC_LOCAL_IP || '10.127.179.146';
const BACKEND_PORT = process.env.EXPO_PUBLIC_BACKEND_PORT || '8080';

export const API_CONFIG = {
  BASE_URL: process.env.EXPO_PUBLIC_API_URL || TUNNEL_URL || `http://${LOCAL_IP}:${BACKEND_PORT}/api/v1`,
  TIMEOUT: 15000,
  CLIENT_TYPE: 'mobile',
  STORAGE_KEYS: {
    ACCESS_TOKEN: 'apsports_mobile_access_token',
    REFRESH_TOKEN: 'apsports_mobile_refresh_token',
    USER_DATA: 'apsports_mobile_user_data',
    CART_DATA: 'apsports_mobile_cart_data',
    SEARCH_HISTORY: 'apsports_mobile_search_history',
  },
};
