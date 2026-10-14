package com.web.ap_sports.controller.warehouse;

import com.web.ap_sports.dto.response.ApiResponse;
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
}
