package com.web.ap_sports.dto.request.customer;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO xử lý đăng nhập bằng Google OAuth2 cho Khách hàng.
 * Hỗ trợ đa nền tảng:
 * - Web Client (Google Identity Services - GIS): gửi trực tiếp chuỗi `idToken` (credential JWT do Google ký).
 * - Mobile App (React Native / Expo OAuth2 Code Flow): gửi `code` và `redirectUri` để Backend đổi lấy `idToken` qua `CUSTOMER_SECRET_CODE`.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GoogleLoginRequest {

    /**
     * Chuỗi Google ID Token (JWT) nhận được từ Google Identity Services (GIS) trên Web hoặc SDK.
     */
    private String idToken;

    /**
     * Mã Authorization Code nhận được từ luồng OAuth2 Redirect trên Mobile App.
     */
    private String code;

    /**
     * Đường dẫn Redirect URI đã dùng khi yêu cầu Authorization Code trên Mobile App.
     */
    private String redirectUri;
}
