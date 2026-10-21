import { Platform } from 'react-native';

/**
 * Cấu hình kết nối API Server Backend AP Sports (Spring Boot).
 * Sử dụng HTTPS Tunnel URL để điện thoại truy cập mượt mà từ bất kỳ mạng nào
 * (WiFi quán Cafe/trường học có AP Isolation, 4G/5G).
 */
const TUNNEL_URL = 'https://apsports-api-dev.loca.lt/api/v1';
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
