package com.web.ap_sports.service.admin;

import com.web.ap_sports.dto.response.customer.UserResponse;
import com.web.ap_sports.dto.response.report.ReportDrilldownOrderResponse;
import com.web.ap_sports.dto.response.report.RevenueOverviewReportResponse;
import com.web.ap_sports.dto.response.report.StaffPerformanceReportResponse;
import com.web.ap_sports.dto.response.report.TopMerchandiseReportResponse;
import com.web.ap_sports.dto.response.report.WarehouseDrilldownStockResponse;
import com.web.ap_sports.dto.response.report.WarehouseDrilldownTransactionResponse;
import com.web.ap_sports.dto.response.report.WarehouseReportResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.List;

public interface AdminReportService {
    RevenueOverviewReportResponse getRevenueOverview(LocalDateTime fromDate, LocalDateTime toDate, Long staffId);

    List<StaffPerformanceReportResponse> getStaffPerformance(LocalDateTime fromDate, LocalDateTime toDate);

    TopMerchandiseReportResponse getTopMerchandise(LocalDateTime fromDate, LocalDateTime toDate, Integer limit);

    WarehouseReportResponse getWarehouseReport(LocalDateTime fromDate, LocalDateTime toDate);

    List<UserResponse> getStaffDropdownList();

    /**
     * Truy vấn phân trang danh sách đơn hàng chi tiết khi người dùng click vào nút giao / cột / lát cắt biểu đồ.
     */
    Page<ReportDrilldownOrderResponse> getDrilldownOrders(
            LocalDateTime fromDate,
            LocalDateTime toDate,
            String statusGroup,
            String paymentMethod,
            Long productId,
            Long categoryId,
            Long staffId,
            Pageable pageable
    );

    /**
     * Truy vấn phân trang danh sách biến thể tồn kho SKU khi người dùng click vào biểu đồ Tồn kho hoặc Cơ cấu Danh mục.
     */
    Page<WarehouseDrilldownStockResponse> getDrilldownStocks(
            String stockFilter,
            Long categoryId,
            Pageable pageable
    );

    /**
     * Truy vấn phân trang nhật ký giao dịch Nhập / Xuất kho khi người dùng click vào biểu đồ Luân chuyển kho.
     */
    Page<WarehouseDrilldownTransactionResponse> getDrilldownTransactions(
            String txFilter,
            LocalDateTime fromDate,
            LocalDateTime toDate,
            Pageable pageable
    );

    /**
     * Truy vấn sổ cái đối soát dòng tiền theo ngày và kênh thanh toán (VNPay vs COD),
     * đồng thời phát hiện các đơn có chênh lệch trạng thái thanh toán cần kế toán xử lý.
     */
    com.web.ap_sports.dto.response.report.FinancialReconciliationResponse getFinancialReconciliation(
            LocalDateTime fromDate,
            LocalDateTime toDate,
            String paymentMethod,
            Long staffId
    );
}
