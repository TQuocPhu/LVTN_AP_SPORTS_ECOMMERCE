/**
 * Hằng số định vị Kho hàng AP Sports Central (Origin WAREHOUSE - Địa điểm cố định thuộc sở hữu của shop).
 * 
 * Thông tin Bưu cục GHN phụ trách được gọi API động trực tiếp từ GHN dựa vào STORE_DISTRICT_ID
 * thay vì hardcode cố định ID trạm, giúp ứng dụng luôn tự động cập nhật chính xác.
 */
export const STORE_LOCATION_CONSTANTS = {
  // Kho hàng trung tâm AP Sports (Đại học Cần Thơ)
  STORE_NAME: 'Kho hàng AP Sports Central',
  STORE_ADDRESS: 'Đại học Cần Thơ, Đường 3/2, Phường Xuân Khánh, Quận Ninh Kiều, Cần Thơ',
  STORE_PROVINCE_ID: 220,  // Cần Thơ
  STORE_DISTRICT_ID: 1442, // Q. Ninh Kiều
  STORE_WARD_CODE: '21211', // P. Xuân Khánh
  STORE_GPS_LATITUDE: 10.0299337,
  STORE_GPS_LONGITUDE: 105.7684266,
} as const;
