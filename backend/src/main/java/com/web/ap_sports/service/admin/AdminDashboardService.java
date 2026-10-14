package com.web.ap_sports.service.admin;

import com.web.ap_sports.dto.response.admin.AdminDashboardResponse;
import com.web.ap_sports.entity.User;

public interface AdminDashboardService {

    /**
     * Lấy dữ liệu tổng hợp Dashboard thời gian thực và phân tích BI
     * Lọc và che giấu trường dữ liệu nghiêm ngặt theo vai trò người dùng (Strict RBAC: ADMIN, STAFF, WAREHOUSE_MANAGER).
     *
     * @param currentUser Người dùng đăng nhập hệ thống
     * @return DTO Dashboard chứa 3 tầng thông tin
     */
    AdminDashboardResponse getDashboardData(User currentUser);
}
