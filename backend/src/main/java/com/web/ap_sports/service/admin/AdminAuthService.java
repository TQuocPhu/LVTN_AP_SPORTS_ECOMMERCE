package com.web.ap_sports.service.admin;

import com.web.ap_sports.dto.request.admin.AdminLoginRequest;
import com.web.ap_sports.dto.response.customer.UserResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

/**
 * Service Interface cho chức năng Xác thực & Đăng nhập Admin Portal.
 */
public interface AdminAuthService {

    /**
     * Xử lý đăng nhập Admin Portal cho các vai trò quản trị (ADMIN, STAFF, WAREHOUSE_MANAGER).
     */
    UserResponse login(AdminLoginRequest request, HttpServletResponse response);

    /**
     * Lấy thông tin Admin/Staff đang đăng nhập từ SecurityContext.
     */
    UserResponse getCurrentAdmin(HttpServletRequest request);

    /**
     * Xử lý đăng xuất khỏi Admin Portal.
     */
    void logout(HttpServletRequest request, HttpServletResponse response);
}
