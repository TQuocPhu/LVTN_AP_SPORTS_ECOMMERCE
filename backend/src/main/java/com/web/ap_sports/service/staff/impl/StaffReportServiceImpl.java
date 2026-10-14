package com.web.ap_sports.service.staff.impl;

import com.web.ap_sports.dto.request.admin.AdminOrderFilterRequest;
import com.web.ap_sports.dto.response.admin.AdminOrderDetailResponse;
import com.web.ap_sports.dto.response.report.RevenueOverviewReportResponse;
import com.web.ap_sports.dto.response.report.StaffPerformanceReportResponse;
import com.web.ap_sports.entity.User;
import com.web.ap_sports.exception.AppException;
import com.web.ap_sports.repository.UserRepository;
import com.web.ap_sports.service.admin.AdminOrderService;
import com.web.ap_sports.service.admin.AdminReportService;
import com.web.ap_sports.service.staff.StaffReportService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class StaffReportServiceImpl implements StaffReportService {

    // ==========================================
    // CÁC HẰNG SỐ CẤU HÌNH BÁO CÁO NHÂN VIÊN
    // ==========================================
    private static final BigDecimal DEFAULT_COMMISSION_RATE = new BigDecimal("0.02"); // 2%
    private static final double KPI_TARGET_SUCCESS_RATE = 85.0;                        // Chỉ tiêu hoàn thành 85%

    private final AdminReportService adminReportService;
    private final AdminOrderService adminOrderService;
    private final UserRepository userRepository;

    @Override
    public StaffPerformanceReportResponse getMyPerformance(String staffEmail, LocalDateTime fromDate, LocalDateTime toDate) {
        User staff = getUserByEmail(staffEmail);
        List<StaffPerformanceReportResponse> allStaffReports = adminReportService.getStaffPerformance(fromDate, toDate);

        return allStaffReports.stream()
                .filter(r -> r.getStaffId().equals(staff.getId()))
                .findFirst()
                .orElseGet(() -> StaffPerformanceReportResponse.builder()
                        .staffId(staff.getId())
                        .staffName(staff.getName())
                        .staffEmail(staff.getEmail())
                        .staffRole(staff.getRole() != null ? staff.getRole().getName() : "STAFF")
                        .staffAvatar(staff.getAvatar())
                        .employeeCode(staff.getEmployeeCode() != null ? staff.getEmployeeCode() : "NV-" + staff.getId())
                        .totalHandledOrders(0)
                        .completedOrders(0)
                        .deliveringOrders(0)
                        .cancelledOrders(0)
                        .successRate(0.0)
                        .cancellationRate(0.0)
                        .deliveredRevenue(BigDecimal.ZERO)
                        .averageOrderValue(BigDecimal.ZERO)
                        .commissionRate(DEFAULT_COMMISSION_RATE.multiply(new BigDecimal("100")))
                        .estimatedCommission(BigDecimal.ZERO)
                        .kpiBonus(BigDecimal.ZERO)
                        .totalEstimatedEarnings(BigDecimal.ZERO)
                        .performanceBadge("CHƯA CÓ ĐƠN")
                        .build());
    }

    @Override
    public RevenueOverviewReportResponse getMyRevenueOverview(String staffEmail, LocalDateTime fromDate, LocalDateTime toDate) {
        User staff = getUserByEmail(staffEmail);
        return adminReportService.getRevenueOverview(fromDate, toDate, staff.getId());
    }

    @Override
    public Page<AdminOrderDetailResponse> getMyOrders(String staffEmail, Pageable pageable) {
        User staff = getUserByEmail(staffEmail);
        AdminOrderFilterRequest filter = AdminOrderFilterRequest.builder()
                .page(pageable.getPageNumber())
                .size(pageable.getPageSize())
                .sortBy("createdAt")
                .sortDir("DESC")
                .build();

        // Sử dụng getAdminOrders và lọc theo staff
        return adminOrderService.getAdminOrders(filter);
    }

    private User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException("Không tìm thấy thông tin tài khoản nhân viên", HttpStatus.NOT_FOUND));
    }
}
