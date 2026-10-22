package com.web.ap_sports.service.common;

import com.web.ap_sports.dto.request.admin.AdminLoginRequest;
import com.web.ap_sports.dto.response.customer.UserResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

public interface DemoLogisticsAuthService {
    UserResponse login(AdminLoginRequest request, HttpServletResponse response);
    UserResponse getCurrentUser(HttpServletRequest request);
    void logout(HttpServletRequest request, HttpServletResponse response);
    void refreshToken(HttpServletRequest request, HttpServletResponse response);
}
