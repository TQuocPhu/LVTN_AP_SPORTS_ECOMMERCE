package com.web.ap_sports.controller.admin;

import com.web.ap_sports.dto.response.ApiResponse;
import com.web.ap_sports.dto.response.admin.AdminDashboardResponse;
import com.web.ap_sports.entity.User;
import com.web.ap_sports.repository.UserRepository;
import com.web.ap_sports.service.admin.AdminDashboardService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin/dashboard")
@RequiredArgsConstructor
@Slf4j
@PreAuthorize("hasAnyRole('ADMIN', 'STAFF', 'WAREHOUSE_MANAGER')")
public class AdminDashboardController {

    private final AdminDashboardService adminDashboardService;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<AdminDashboardResponse>> getDashboard(Authentication authentication) {
        String email = authentication != null ? authentication.getName() : null;
        log.info("REST request truy vấn Dashboard tổng quan & BI từ tài khoản [{}]", email);

        User currentUser = null;
        if (email != null) {
            currentUser = userRepository.findByEmail(email).orElse(null);
        }

        AdminDashboardResponse response = adminDashboardService.getDashboardData(currentUser);
        return ResponseEntity.ok(ApiResponse.success("Lấy dữ liệu Dashboard tổng quan thành công!", response));
    }
}
