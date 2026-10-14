package com.web.ap_sports.service.admin;

import com.web.ap_sports.dto.response.customer.UserResponse;
import com.web.ap_sports.dto.response.report.RevenueOverviewReportResponse;
import com.web.ap_sports.dto.response.report.StaffPerformanceReportResponse;
import com.web.ap_sports.dto.response.report.TopMerchandiseReportResponse;
import com.web.ap_sports.dto.response.report.WarehouseReportResponse;

import java.time.LocalDateTime;
import java.util.List;

public interface AdminReportService {
    RevenueOverviewReportResponse getRevenueOverview(LocalDateTime fromDate, LocalDateTime toDate, Long staffId);

    List<StaffPerformanceReportResponse> getStaffPerformance(LocalDateTime fromDate, LocalDateTime toDate);

    TopMerchandiseReportResponse getTopMerchandise(LocalDateTime fromDate, LocalDateTime toDate, Integer limit);

    WarehouseReportResponse getWarehouseReport(LocalDateTime fromDate, LocalDateTime toDate);

    List<UserResponse> getStaffDropdownList();
}
