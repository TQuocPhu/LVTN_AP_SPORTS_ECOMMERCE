package com.web.ap_sports.controller.staff;

import com.web.ap_sports.dto.response.ApiResponse;
import com.web.ap_sports.dto.response.admin.AdminOrderDetailResponse;
import com.web.ap_sports.dto.response.report.RevenueOverviewReportResponse;
import com.web.ap_sports.dto.response.report.StaffPerformanceReportResponse;
import com.web.ap_sports.service.staff.StaffReportService;
import com.web.ap_sports.util.ReportDateUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/v1/staff/reports")
@RequiredArgsConstructor
@Slf4j
@PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
public class StaffReportController {

    private final StaffReportService staffReportService;

    @GetMapping("/my-performance")
    public ResponseEntity<ApiResponse<StaffPerformanceReportResponse>> getMyPerformance(
            @RequestParam(required = false, defaultValue = "THIS_MONTH") String timeRange,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            Authentication authentication) {

        LocalDateTime[] range = ReportDateUtil.parseDateRange(timeRange, startDate, endDate);
        String email = authentication.getName();
        log.info("Nhân viên [{}] truy vấn hiệu suất cá nhân: timeRange={}", email, timeRange);

        StaffPerformanceReportResponse res = staffReportService.getMyPerformance(email, range[0], range[1]);
        return ResponseEntity.ok(ApiResponse.success("Lấy báo cáo hiệu suất cá nhân thành công!", res));
    }

    @GetMapping("/my-revenue")
    public ResponseEntity<ApiResponse<RevenueOverviewReportResponse>> getMyRevenue(
            @RequestParam(required = false, defaultValue = "THIS_MONTH") String timeRange,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            Authentication authentication) {

        LocalDateTime[] range = ReportDateUtil.parseDateRange(timeRange, startDate, endDate);
        String email = authentication.getName();
        log.info("Nhân viên [{}] truy vấn doanh thu cá nhân: timeRange={}", email, timeRange);

        RevenueOverviewReportResponse res = staffReportService.getMyRevenueOverview(email, range[0], range[1]);
        return ResponseEntity.ok(ApiResponse.success("Lấy báo cáo doanh thu cá nhân thành công!", res));
    }

    @GetMapping("/my-orders")
    public ResponseEntity<ApiResponse<Page<AdminOrderDetailResponse>>> getMyOrders(
            @RequestParam(required = false, defaultValue = "0") int page,
            @RequestParam(required = false, defaultValue = "10") int size,
            Authentication authentication) {

        String email = authentication.getName();
        log.info("Nhân viên [{}] truy vấn danh sách đơn hàng phụ trách", email);

        Page<AdminOrderDetailResponse> res = staffReportService.getMyOrders(email, PageRequest.of(Math.max(0, page), Math.max(1, size)));
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách đơn hàng phụ trách thành công!", res));
    }
}
