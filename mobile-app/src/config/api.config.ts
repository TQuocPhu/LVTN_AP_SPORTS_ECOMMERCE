import { Platform } from 'react-native';

/**
 * Cấu hình kết nối API Server Backend AP Sports (Spring Boot).
 * - Kết nối trực tiếp qua IP LAN: Ổn định 100%, không bao giờ bị lỗi 503 hết hạn tunnel.
 * - Khi cần test qua 4G ngoài đường: Chạy `npx localtunnel --port 8080 --subdomain apsports-api-dev` và bật lại TUNNEL_URL.
 */
const TUNNEL_URL = ''; // Để trống để dùng trực tiếp IP máy tính
const LOCAL_IP = '10.10.13.107';

export const API_CONFIG = {
  BASE_URL: TUNNEL_URL || `http://${LOCAL_IP}:8080/api/v1`,
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
