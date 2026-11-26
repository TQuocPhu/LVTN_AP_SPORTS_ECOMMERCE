package com.web.ap_sports.controller.warehouse;

import com.web.ap_sports.dto.response.ApiResponse;
import com.web.ap_sports.dto.response.report.WarehouseDrilldownStockResponse;
import com.web.ap_sports.dto.response.report.WarehouseDrilldownTransactionResponse;
import com.web.ap_sports.dto.response.report.WarehouseReportResponse;
import com.web.ap_sports.service.admin.AdminReportService;
import com.web.ap_sports.util.ReportDateUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/v1/warehouse/reports")
@RequiredArgsConstructor
@Slf4j
@PreAuthorize("hasAnyRole('WAREHOUSE_MANAGER', 'ADMIN')")
public class WarehouseReportController {

    private final AdminReportService adminReportService;

    @GetMapping("/inventory")
    public ResponseEntity<ApiResponse<WarehouseReportResponse>> getWarehouseReport(
            @RequestParam(required = false, defaultValue = "LAST_30_DAYS") String timeRange,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

        LocalDateTime[] range = ReportDateUtil.parseDateRange(timeRange, startDate, endDate);
        log.info("Thủ kho truy vấn báo cáo kho hàng: timeRange={}, from={}, to={}", timeRange, range[0], range[1]);

        WarehouseReportResponse res = adminReportService.getWarehouseReport(range[0], range[1]);
        return ResponseEntity.ok(ApiResponse.success("Lấy báo cáo kho hàng thành công!", res));
    }

    /**
     * API lấy danh sách biến thể tồn kho chi tiết khi click vào biểu đồ Tỷ lệ An toàn Tồn kho SKU.
     */
    @GetMapping("/drilldown-stocks")
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
        return ResponseEntity.ok(ApiResponse.success("Lấy bảng chi tiết tồn kho thành công!", res));
    }

    /**
     * API lấy nhật ký giao dịch Nhập / Xuất kho chi tiết khi click vào biểu đồ Cân đối Nhập - Xuất kho.
     */
    @GetMapping("/drilldown-transactions")
    public ResponseEntity<ApiResponse<Page<WarehouseDrilldownTransactionResponse>>> getDrilldownTransactions(
            @RequestParam(required = false, defaultValue = "ALL") String txFilter,
            @RequestParam(required = false, defaultValue = "LAST_30_DAYS") String timeRange,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate specificDate,
            @RequestParam(required = false, defaultValue = "0") int page,
            @RequestParam(required = false, defaultValue = "10") int size
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

        Page<WarehouseDrilldownTransactionResponse> res = adminReportService.getDrilldownTransactions(
                txFilter,
                from,
                to,
                PageRequest.of(Math.max(0, page), Math.max(1, size))
        );
        return ResponseEntity.ok(ApiResponse.success("Lấy bảng chi tiết giao dịch kho thành công!", res));
    }
}
