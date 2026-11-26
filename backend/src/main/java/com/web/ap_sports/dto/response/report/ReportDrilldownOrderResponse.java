package com.web.ap_sports.dto.response.report;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * DTO biểu diễn một dòng đơn hàng chi tiết trong Modal Bảng Thống Kê khi người dùng
 * click vào nút giao / cột / lát cắt của biểu đồ Báo cáo hoặc Dashboard.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReportDrilldownOrderResponse {

    private Long orderId;
    private String orderCode;
    private LocalDateTime createdAt;

    // Thông tin người mua
    private String customerName;
    private String customerPhone;
    private String customerEmail;

    // Trạng thái đơn & Thanh toán
    private String status;
    private String paymentMethod; // COD, VNPAY
    private String paymentStatus; // pending, completed, failed, refunded

    // Giá trị tài chính đơn hàng
    private BigDecimal totalPrice;
    private BigDecimal shippingFee;
    private BigDecimal discountAmount;
    private BigDecimal finalAmount;

    // Nhân viên xác nhận phụ trách đơn
    private String processedByStaffName;

    // Tổng số lượng sản phẩm trong đơn
    private int totalQuantity;

    // Danh sách chi tiết các mặt hàng & biến thể đã mua trong đơn
    private List<DrilldownOrderItemDto> items;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DrilldownOrderItemDto {
        private Long productId;
        private String productName;
        private String sku;
        private String variantLabel;
        private int quantity;
        private BigDecimal unitPrice;
        private BigDecimal subtotal;
        /**
         * Đánh dấu mặt hàng khớp trực tiếp với bộ lọc sản phẩm / danh mục khi click từ biểu đồ Sản phẩm / Danh mục.
         */
        private boolean matchedFilter;
    }
}
