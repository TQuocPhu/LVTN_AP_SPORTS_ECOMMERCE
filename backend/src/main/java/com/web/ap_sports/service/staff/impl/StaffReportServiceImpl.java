package com.web.ap_sports.service.staff.impl;

import com.web.ap_sports.dto.response.admin.AdminOrderDetailResponse;
import com.web.ap_sports.dto.response.report.RevenueOverviewReportResponse;
import com.web.ap_sports.dto.response.report.StaffPerformanceReportResponse;
import com.web.ap_sports.entity.Order;
import com.web.ap_sports.entity.User;
import com.web.ap_sports.enums.OrderStatus;
import com.web.ap_sports.exception.AppException;
import com.web.ap_sports.repository.OrderRepository;
import com.web.ap_sports.repository.UserRepository;
import com.web.ap_sports.service.admin.AdminOrderService;
import com.web.ap_sports.service.admin.AdminReportService;
import com.web.ap_sports.service.staff.StaffReportService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class StaffReportServiceImpl implements StaffReportService {

    private final AdminReportService adminReportService;
    private final AdminOrderService adminOrderService;
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;

    @Override
    public StaffPerformanceReportResponse getMyPerformance(String staffEmail, LocalDateTime fromDate, LocalDateTime toDate) {
        User staff = getUserByEmail(staffEmail);
        List<StaffPerformanceReportResponse> allStaffReports = adminReportService.getStaffPerformance(fromDate, toDate);

        StaffPerformanceReportResponse found = allStaffReports.stream()
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
                        .commissionRate(BigDecimal.ZERO)
                        .estimatedCommission(BigDecimal.ZERO)
                        .kpiBonus(BigDecimal.ZERO)
                        .totalEstimatedEarnings(BigDecimal.ZERO)
                        .performanceBadge("ĐANG QUẢN LÝ")
                        .build());

        // Không tính hoa hồng & thưởng KPI trong phạm vi hệ thống theo chuẩn nghiệp vụ mới
        found.setCommissionRate(BigDecimal.ZERO);
        found.setEstimatedCommission(BigDecimal.ZERO);
        found.setKpiBonus(BigDecimal.ZERO);
        found.setTotalEstimatedEarnings(BigDecimal.ZERO);
        return found;
    }

    @Override
    public RevenueOverviewReportResponse getMyRevenueOverview(String staffEmail, LocalDateTime fromDate, LocalDateTime toDate) {
        User staff = getUserByEmail(staffEmail);
        return adminReportService.getRevenueOverview(fromDate, toDate, staff.getId());
    }

    /**
     * Trả về danh sách đơn hàng do CHÍNH nhân viên đang đăng nhập xác nhận và phụ trách (processedByStaff),
     * hỗ trợ lọc nhanh theo nhóm trạng thái (ALL, COMPLETED, DELIVERING, CANCELLED).
     */
    @Override
    public Page<AdminOrderDetailResponse> getMyOrders(String staffEmail, String statusGroup, Pageable pageable) {
        User staff = getUserByEmail(staffEmail);
        Page<Order> orderPage;

        if (StringUtils.hasText(statusGroup) && !"ALL".equalsIgnoreCase(statusGroup.trim())) {
            String normalized = statusGroup.trim().toUpperCase();
            List<OrderStatus> statuses;
            switch (normalized) {
                case "COMPLETED":
                    statuses = List.of(OrderStatus.delivered, OrderStatus.completed);
                    break;
                case "DELIVERING":
                    statuses = List.of(OrderStatus.confirmed, OrderStatus.processing, OrderStatus.shipped, OrderStatus.shipping);
                    break;
                case "CANCELLED":
                    statuses = List.of(OrderStatus.cancelled, OrderStatus.returned);
                    break;
                default:
                    OrderStatus exact = OrderStatus.fromString(statusGroup.trim().toLowerCase());
                    statuses = exact != null ? List.of(exact) : List.of(OrderStatus.values());
                    break;
            }
            orderPage = orderRepository.findByProcessedByStaffIdAndStatusInOrderByCreatedAtDesc(staff.getId(), statuses, pageable);
        } else {
            orderPage = orderRepository.findByProcessedByStaffIdOrderByCreatedAtDesc(staff.getId(), pageable);
        }

        List<AdminOrderDetailResponse> details = orderPage.getContent().stream()
                .map(o -> adminOrderService.getAdminOrderById(o.getId()))
                .collect(Collectors.toList());

        return new PageImpl<>(details, pageable, orderPage.getTotalElements());
    }

    private User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException("Không tìm thấy thông tin tài khoản nhân viên", HttpStatus.NOT_FOUND));
    }
}
