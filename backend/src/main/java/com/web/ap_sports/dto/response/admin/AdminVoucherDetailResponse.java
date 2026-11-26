package com.web.ap_sports.dto.response.admin;

import com.web.ap_sports.dto.response.common.VoucherResponse;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * DTO phản hồi thông tin chi tiết toàn diện của một Mã Giảm Giá (Voucher) dành cho Admin,
 * bao gồm cấu hình chương trình, thống kê ngân sách giảm giá thực tế và danh sách đơn hàng đã áp dụng.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminVoucherDetailResponse {

    /**
     * Thông tin cấu hình và trạng thái chuẩn hóa của Voucher.
     */
    private VoucherResponse voucher;

    /**
     * Tổng số đơn hàng đã áp dụng mã giảm giá này (không tính đơn bị hủy / lỗi thanh toán).
     */
    private long validAppliedOrdersCount;

    /**
     * Tổng số đơn hàng áp mã đã giao thành công / hoàn tất.
     */
    private long completedAppliedOrdersCount;

    /**
     * Tổng số tiền thực tế đã giảm cho khách hàng từ các đơn hợp lệ.
     */
    private BigDecimal totalDiscountGranted;

    /**
     * Tổng doanh thu thu về từ các đơn hàng có áp dụng mã giảm giá này.
     */
    private BigDecimal totalOrderRevenueGenerated;

    /**
     * Số lượt phát hành còn lại toàn sàn (null nếu không giới hạn).
     */
    private Integer remainingGlobalUses;

    /**
     * Danh sách các đơn hàng gần nhất đã áp dụng mã giảm giá này.
     */
    private List<VoucherAppliedOrderItem> recentAppliedOrders;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class VoucherAppliedOrderItem {
        private Long orderId;
        private String orderCode;
        private String customerName;
        private String customerPhone;
        private BigDecimal totalPrice;
        private BigDecimal discountAmount;
        private BigDecimal finalAmount;
        private String status;
        private LocalDateTime createdAt;
    }
}
