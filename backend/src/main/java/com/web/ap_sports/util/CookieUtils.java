package com.web.ap_sports.util;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

/**
 * Utility class chuyên trách quản lý HttpOnly Cookies cho toàn bộ hệ thống AP Sports.
 * Đảm bảo đồng bộ 100% thuộc tính cấu hình an toàn (HttpOnly, Path, Max-Age).
 */
public class CookieUtils {

    public static final int ACCESS_TOKEN_MAX_AGE = 1800; // 30 phút (tính bằng giây)
    public static final int REFRESH_TOKEN_MAX_AGE = 604800; // 7 ngày (tính bằng giây)

    public static final String ACCESS_TOKEN_COOKIE_NAME = "accessToken";
    public static final String REFRESH_TOKEN_COOKIE_NAME = "refreshToken";

    private CookieUtils() {
        // Private constructor to prevent instantiation
    }

    /**
     * Thêm HttpOnly Cookie lưu Token an toàn vào Response.
     */
    public static void addTokenCookie(HttpServletResponse response, String name, String value, int maxAgeSeconds) {
        Cookie cookie = new Cookie(name, value);
        cookie.setHttpOnly(true);
        cookie.setSecure(false); // Đặt true khi môi trường Production sử dụng HTTPS
        cookie.setPath("/");
        cookie.setMaxAge(maxAgeSeconds);
        response.addCookie(cookie);
    }

    /**
     * Xóa HttpOnly Cookie bằng cách đặt Max-Age = 0.
     */
    public static void deleteCookie(HttpServletResponse response, String name) {
        Cookie cookie = new Cookie(name, null);
        cookie.setHttpOnly(true);
        cookie.setPath("/");
        cookie.setMaxAge(0);
        response.addCookie(cookie);
    }

    /**
     * Trích xuất giá trị Cookie từ HttpServletRequest theo tên.
     */
    public static String extractCookieValue(HttpServletRequest request, String cookieName) {
        if (request.getCookies() != null) {
            for (Cookie cookie : request.getCookies()) {
                if (cookieName.equals(cookie.getName())) {
                    return cookie.getValue();
                }
            }
        }
        return null;
    }
}
