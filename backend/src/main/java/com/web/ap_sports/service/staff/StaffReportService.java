package com.web.ap_sports.service.staff;

import com.web.ap_sports.dto.response.admin.AdminOrderDetailResponse;
import com.web.ap_sports.dto.response.report.RevenueOverviewReportResponse;
import com.web.ap_sports.dto.response.report.StaffPerformanceReportResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;

public interface StaffReportService {
    StaffPerformanceReportResponse getMyPerformance(String staffEmail, LocalDateTime fromDate, LocalDateTime toDate);

    RevenueOverviewReportResponse getMyRevenueOverview(String staffEmail, LocalDateTime fromDate, LocalDateTime toDate);

    Page<AdminOrderDetailResponse> getMyOrders(String staffEmail, Pageable pageable);
}
