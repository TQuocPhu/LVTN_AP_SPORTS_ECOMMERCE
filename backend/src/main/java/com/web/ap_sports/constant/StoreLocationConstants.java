package com.web.ap_sports.constant;

/**
 * Hằng số định vị Kho hàng AP Sports Central (Origin WAREHOUSE - Địa điểm cố định thuộc sở hữu/quản lý của shop).
 * 
 * Lưu ý: Thông tin bưu cục kho GHN (Station ID, Station Name, Station Address, GPS Trạm)
 * KHÔNG hardcode gán chết cố định, mà được truy vấn động trực tiếp từ GHN API (/station/get) 
 * dựa vào STORE_DISTRICT_ID và STORE_WARD_CODE nhằm tự động cập nhật khi GHN thay đổi địa chỉ hoặc ID bưu cục.
 */
public final class StoreLocationConstants {

    private StoreLocationConstants() {
        // Private constructor to prevent instantiation
    }

    // =========================================================================
    // KHO HÀNG CHÍNH AP SPORTS CENTRAL (ORIGIN WAREHOUSE - ĐẠI HỌC CẦN THƠ)
    // =========================================================================
    public static final String STORE_NAME = "Kho hàng AP Sports Central";
    public static final String STORE_ADDRESS = "Đại học Cần Thơ, Đường 3/2, Phường Xuân Khánh, Quận Ninh Kiều, Cần Thơ";
    public static final Integer STORE_PROVINCE_ID = 220;  // Cần Thơ
    public static final Integer STORE_DISTRICT_ID = 1442; // Quận Ninh Kiều
    public static final String STORE_WARD_CODE = "21211"; // Phường Xuân Khánh
    public static final double STORE_GPS_LATITUDE = 10.0299337;
    public static final double STORE_GPS_LONGITUDE = 105.7684266;
}
