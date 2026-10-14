package com.web.ap_sports.controller.admin;

import com.web.ap_sports.dto.response.ApiResponse;
import com.web.ap_sports.dto.response.customer.UserResponse;
import com.web.ap_sports.dto.response.report.RevenueOverviewReportResponse;
import com.web.ap_sports.dto.response.report.StaffPerformanceReportResponse;
import com.web.ap_sports.dto.response.report.TopMerchandiseReportResponse;
import com.web.ap_sports.dto.response.report.WarehouseReportResponse;
import com.web.ap_sports.service.admin.AdminReportService;
import com.web.ap_sports.util.ReportDateUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/reports")
@RequiredArgsConstructor
@Slf4j
@PreAuthorize("hasRole('ADMIN')")
public class AdminReportController {

    private final AdminReportService adminReportService;

    @GetMapping("/overview")
    public ResponseEntity<ApiResponse<RevenueOverviewReportResponse>> getRevenueOverview(
            @RequestParam(required = false, defaultValue = "LAST_30_DAYS") String timeRange,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) Long staffId) {

        LocalDateTime[] range = ReportDateUtil.parseDateRange(timeRange, startDate, endDate);
        log.info("Admin truy vấn báo cáo doanh thu tổng quan: timeRange={}, from={}, to={}, staffId={}",
                timeRange, range[0], range[1], staffId);

        RevenueOverviewReportResponse res = adminReportService.getRevenueOverview(range[0], range[1], staffId);
        return ResponseEntity.ok(ApiResponse.success("Lấy báo cáo doanh thu tổng quan thành công!", res));
    }

    @GetMapping("/staff-performance")
    public ResponseEntity<ApiResponse<List<StaffPerformanceReportResponse>>> getStaffPerformance(
            @RequestParam(required = false, defaultValue = "LAST_30_DAYS") String timeRange,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

        LocalDateTime[] range = ReportDateUtil.parseDateRange(timeRange, startDate, endDate);
        log.info("Admin truy vấn hiệu suất nhân viên: timeRange={}, from={}, to={}", timeRange, range[0], range[1]);

        List<StaffPerformanceReportResponse> res = adminReportService.getStaffPerformance(range[0], range[1]);
        return ResponseEntity.ok(ApiResponse.success("Lấy báo cáo hiệu suất nhân viên thành công!", res));
    }

    @GetMapping("/top-merchandise")
    public ResponseEntity<ApiResponse<TopMerchandiseReportResponse>> getTopMerchandise(
            @RequestParam(required = false, defaultValue = "LAST_30_DAYS") String timeRange,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false, defaultValue = "10") Integer limit) {

        LocalDateTime[] range = ReportDateUtil.parseDateRange(timeRange, startDate, endDate);
        log.info("Admin truy vấn top sản phẩm & danh mục: timeRange={}, limit={}", timeRange, limit);

        TopMerchandiseReportResponse res = adminReportService.getTopMerchandise(range[0], range[1], limit);
        return ResponseEntity.ok(ApiResponse.success("Lấy báo cáo sản phẩm & danh mục thành công!", res));
    }

    @GetMapping("/warehouse")
    public ResponseEntity<ApiResponse<WarehouseReportResponse>> getWarehouseReport(
            @RequestParam(required = false, defaultValue = "LAST_30_DAYS") String timeRange,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

        LocalDateTime[] range = ReportDateUtil.parseDateRange(timeRange, startDate, endDate);
        log.info("Admin truy vấn báo cáo kho & tồn kho: timeRange={}, from={}, to={}", timeRange, range[0], range[1]);

        WarehouseReportResponse res = adminReportService.getWarehouseReport(range[0], range[1]);
        return ResponseEntity.ok(ApiResponse.success("Lấy báo cáo kho hàng thành công!", res));
    }

    @GetMapping("/staff-list")
    public ResponseEntity<ApiResponse<List<UserResponse>>> getStaffDropdownList() {
        List<UserResponse> list = adminReportService.getStaffDropdownList();
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách nhân viên thành công!", list));
    }
}
