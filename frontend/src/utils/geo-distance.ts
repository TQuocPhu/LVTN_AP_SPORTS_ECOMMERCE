import { STORE_LOCATION_CONSTANTS } from '@/constants/location-constants';

/**
 * Tính khoảng cách địa lý theo công thức Haversine (Great-Circle Distance) giữa 2 điểm GPS.
 * Trả về khoảng cách tính bằng Kilomet (km) làm tròn 1 chữ số thập phân.
 */
export function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 171.9;

  const R = 6371; // Bán kính Trái Đất (km)
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const dist = Math.round(R * c * 10) / 10;
  return dist > 0 ? dist : 171.9;
}

/**
 * Tính khoảng cách địa lý ĐỘNG từ Kho AP Sports ĐHCT đến địa chỉ GPS của Đơn hàng.
 * Nếu đơn hàng thiếu GPS (0,0 hoặc null), tự động dùng fallback mặc định 171.9 km.
 */
export function calculateOrderDistanceKm(
  destLat?: number | null,
  destLng?: number | null,
  fallbackKm: number = 171.9
): number {
  const originLat = STORE_LOCATION_CONSTANTS.STORE_GPS_LATITUDE || 10.03054;
  const originLng = STORE_LOCATION_CONSTANTS.STORE_GPS_LONGITUDE || 105.78280;

  if (
    destLat === undefined ||
    destLat === null ||
    destLng === undefined ||
    destLng === null ||
    (destLat === 0 && destLng === 0)
  ) {
    return fallbackKm;
  }

  return calculateHaversineDistance(originLat, originLng, destLat, destLng);
}
