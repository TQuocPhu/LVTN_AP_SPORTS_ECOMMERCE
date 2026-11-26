package com.web.ap_sports.controller.admin;

import com.web.ap_sports.dto.response.ApiResponse;
import com.web.ap_sports.dto.response.customer.UserResponse;
import com.web.ap_sports.dto.response.report.ReportDrilldownOrderResponse;
import com.web.ap_sports.dto.response.report.RevenueOverviewReportResponse;
import com.web.ap_sports.dto.response.report.StaffPerformanceReportResponse;
import com.web.ap_sports.dto.response.report.TopMerchandiseReportResponse;
import com.web.ap_sports.dto.response.report.WarehouseDrilldownStockResponse;
import com.web.ap_sports.dto.response.report.WarehouseReportResponse;
import com.web.ap_sports.entity.User;
import com.web.ap_sports.repository.UserRepository;
import com.web.ap_sports.service.admin.AdminReportService;
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
import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/reports")
@RequiredArgsConstructor
@Slf4j
public class AdminReportController {

    private final AdminReportService adminReportService;
    private final UserRepository userRepository;

    @GetMapping("/overview")
    @PreAuthorize("hasRole('ADMIN')")
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
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<StaffPerformanceReportResponse>>> getStaffPerformance(
            @RequestParam(required = false, defaultValue = "LAST_30_DAYS") String timeRange,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

        LocalDateTime[] range = ReportDateUtil.parseDateRange(timeRange, startDate, endDate);
        log.info("Admin truy vấn hiệu suất nhân viên: timeRange={}, from={}, to={}", timeRange, range[0], range[1]);

        List<StaffPerformanceReportResponse> res = adminReportService.getStaffPerformance(range[0], range[1]);
        return ResponseEntity.ok(ApiResponse.success("Lấy báo cáo hiệu suất nhân viên thành công!", res));
    }

    /**
     * Thống kê Top sản phẩm & Tỷ trọng danh mục (Phân quyền cho cả ADMIN và STAFF tại mục Thống kê Sản phẩm).
     */
    @GetMapping("/top-merchandise")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<TopMerchandiseReportResponse>> getTopMerchandise(
            @RequestParam(required = false, defaultValue = "LAST_30_DAYS") String timeRange,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false, defaultValue = "10") Integer limit) {

        LocalDateTime[] range = ReportDateUtil.parseDateRange(timeRange, startDate, endDate);
        log.info("Truy vấn top sản phẩm & danh mục: timeRange={}, limit={}", timeRange, limit);

        TopMerchandiseReportResponse res = adminReportService.getTopMerchandise(range[0], range[1], limit);
        return ResponseEntity.ok(ApiResponse.success("Lấy báo cáo sản phẩm & danh mục thành công!", res));
    }

    @GetMapping("/warehouse")
    @PreAuthorize("hasAnyRole('ADMIN', 'WAREHOUSE_MANAGER')")
    public ResponseEntity<ApiResponse<WarehouseReportResponse>> getWarehouseReport(
            @RequestParam(required = false, defaultValue = "LAST_30_DAYS") String timeRange,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

        LocalDateTime[] range = ReportDateUtil.parseDateRange(timeRange, startDate, endDate);
        log.info("Truy vấn báo cáo kho & tồn kho: timeRange={}, from={}, to={}", timeRange, range[0], range[1]);

        WarehouseReportResponse res = adminReportService.getWarehouseReport(range[0], range[1]);
        return ResponseEntity.ok(ApiResponse.success("Lấy báo cáo kho hàng thành công!", res));
    }

    @GetMapping("/staff-list")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<UserResponse>>> getStaffDropdownList() {
        List<UserResponse> list = adminReportService.getStaffDropdownList();
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách nhân viên thành công!", list));
    }

    /**
     * API lấy danh sách đơn hàng chi tiết có phân trang cho Modal khi click nút giao biểu đồ.
     * RBAC:
     * - ADMIN: Xem toàn bộ đơn hàng theo đúng nút giao vừa bấm.
     * - STAFF: Nếu không lọc theo sản phẩm/danh mục (VD: click biểu đồ Phễu hoặc Trạng thái đơn cá nhân trên Dashboard),
     *   hệ thống tự động khóa cứng staffId = chính nhân viên đang đăng nhập để chống xem chéo doanh thu tổng.
     */
    @GetMapping("/drilldown-orders")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<Page<ReportDrilldownOrderResponse>>> getDrilldownOrders(
            @RequestParam(required = false, defaultValue = "LAST_30_DAYS") String timeRange,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate specificDate,
            @RequestParam(required = false, defaultValue = "ALL") String statusGroup,
            @RequestParam(required = false, defaultValue = "ALL") String paymentMethod,
            @RequestParam(required = false) Long productId,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false, defaultValue = "0") int page,
            @RequestParam(required = false, defaultValue = "10") int size,
            Authentication authentication
    ) {
        LocalDateTime from;
        LocalDateTime to;
        if (specificDate != null) {
            from = specificDate.atStartOfDay();
            to = specificDate.atTime(23, 59, 59, 999_999_999);
        } else if ("ALL_TIME".equalsIgnoreCase(timeRange)) {
            from = null;
            to = null;
        } else {
            LocalDateTime[] range = ReportDateUtil.parseDateRange(timeRange, startDate, endDate);
            from = range[0];
            to = range[1];
        }

        Long enforcedStaffId = null;
        if (authentication != null) {
            User currentUser = userRepository.findByEmail(authentication.getName()).orElse(null);
            if (currentUser != null && currentUser.getRole() != null
                    && "STAFF".equalsIgnoreCase(currentUser.getRole().getName())
                    && productId == null && categoryId == null) {
                enforcedStaffId = currentUser.getId();
            }
        }

        Page<ReportDrilldownOrderResponse> res = adminReportService.getDrilldownOrders(
                from,
                to,
                statusGroup,
                paymentMethod,
                productId,
                categoryId,
                enforcedStaffId,
                PageRequest.of(Math.max(0, page), Math.max(1, size))
        );
        return ResponseEntity.ok(ApiResponse.success("Lấy bảng chi tiết đơn hàng thành công!", res));
    }

    /**
     * API lấy bảng chi tiết Biến thể & Tồn kho theo Danh mục hoặc Ngưỡng tồn kho
     * (Phục vụ khi click vào Biểu đồ Tròn Cơ Cấu Danh Mục trên Dashboard cho cả 3 vai trò quản trị).
     */
    @GetMapping("/drilldown-stocks")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF', 'WAREHOUSE_MANAGER')")
    public ResponseEntity<ApiResponse<Page<WarehouseDrilldownStockResponse>>> getDrilldownStocks(
            @RequestParam(required = false, defaultValue = "ALL") String stockFilter,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false, defaultValue = "0") int page,
            @RequestParam(required = false, defaultValue = "10") int size
    ) {
        Page<WarehouseDrilldownStockResponse> res = adminReportService.getDrilldownStocks(
                stockFilter,
                categoryId,
                PageRequest.of(Math.max(0, page), Math.max(1, size))
        );
        return ResponseEntity.ok(ApiResponse.success("Lấy bảng chi tiết biến thể tồn kho thành công!", res));
    }
}
