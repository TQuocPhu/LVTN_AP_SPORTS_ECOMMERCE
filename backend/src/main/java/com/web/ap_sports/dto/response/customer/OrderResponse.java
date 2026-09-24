package com.web.ap_sports.dto.response.customer;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderResponse {
    private Long id;
    private String orderCode;
    private BigDecimal totalPrice;
    private BigDecimal shippingFee;
    private BigDecimal discountAmount;
    private BigDecimal finalAmount;
    private String status; // pending, confirmed, processing, shipping, delivered, canceled, returned, payment_failed
    private String paymentMethod; // COD, VNPAY
    private String paymentStatus; // pending, completed, failed
    private String paymentUrl; // Dành riêng cho VNPay khi cần thanh toán / thanh toán lại
    private ShippingAddressResponse shippingAddress;
    
    // Mã vận đơn GHN & Tọa độ giao hàng
    private String trackingCode;
    private String shippingProvider;
    private Double gpsLatitude;
    private Double gpsLongitude;

    // Thông tin bưu cục / kho GHN gần nhất
    private Integer ghnStationId;
    private String ghnStationName;
    private String ghnStationAddress;
    private Double ghnStationLatitude;
    private Double ghnStationLongitude;

    private String note;
    private List<OrderItemResponse> items;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
