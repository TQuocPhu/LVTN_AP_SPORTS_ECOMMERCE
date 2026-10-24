package com.web.ap_sports.util;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;

/**
 * Utility class chuyên trách quản lý HttpOnly Cookies cho toàn bộ hệ thống AP Sports.
 * Sử dụng ResponseCookie chuẩn Spring Framework với SameSite=Lax chống tấn công CSRF.
 * Đảm bảo đồng bộ 100% thuộc tính cấu hình an toàn (HttpOnly, SameSite, Path, Max-Age).
 */
public class CookieUtils {

    public static final int ACCESS_TOKEN_MAX_AGE = 1800; // 30 phút (tính bằng giây)
    public static final int REFRESH_TOKEN_MAX_AGE = 604800; // 7 ngày (tính bằng giây)

    public static final String ACCESS_TOKEN_COOKIE_NAME = "accessToken";
    public static final String REFRESH_TOKEN_COOKIE_NAME = "refreshToken";
    public static final String DEVICE_ID_COOKIE_NAME = "apsports_device_id";
    public static final int DEVICE_ID_MAX_AGE = 315360000; // 10 năm (tính bằng giây)

    private CookieUtils() {
        // Private constructor to prevent instantiation
    }

    /**
     * Thêm HttpOnly Cookie lưu Token an toàn vào Response với SameSite=Lax.
     */
    public static void addTokenCookie(HttpServletResponse response, String name, String value, int maxAgeSeconds) {
        addTokenCookie(response, name, value, maxAgeSeconds, false);
    }

    /**
     * Thêm HttpOnly Cookie hỗ trợ chỉ định cờ Secure (true khi HTTPS trên Production).
     */
    public static void addTokenCookie(HttpServletResponse response, String name, String value, int maxAgeSeconds, boolean secure) {
        ResponseCookie cookie = ResponseCookie.from(name, value)
                .httpOnly(true)
                .secure(secure)
                .sameSite("Lax")
                .path("/")
                .maxAge(maxAgeSeconds)
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }

    /**
     * Xóa HttpOnly Cookie bằng cách đặt Max-Age = 0 với SameSite=Lax đồng bộ.
     */
    public static void deleteCookie(HttpServletResponse response, String name) {
        deleteCookie(response, name, false);
    }

    /**
     * Xóa HttpOnly Cookie hỗ trợ cờ Secure đồng bộ.
     */
    public static void deleteCookie(HttpServletResponse response, String name, boolean secure) {
        ResponseCookie cookie = ResponseCookie.from(name, "")
                .httpOnly(true)
                .secure(secure)
                .sameSite("Lax")
                .path("/")
                .maxAge(0)
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }

    /**
     * Trích xuất giá trị Cookie từ HttpServletRequest theo tên.
     */
    public static String extractCookieValue(HttpServletRequest request, String cookieName) {
        if (request != null && request.getCookies() != null) {
            for (Cookie cookie : request.getCookies()) {
                if (cookieName.equals(cookie.getName())) {
                    return cookie.getValue();
                }
            }
        }
        return null;
    }
}
