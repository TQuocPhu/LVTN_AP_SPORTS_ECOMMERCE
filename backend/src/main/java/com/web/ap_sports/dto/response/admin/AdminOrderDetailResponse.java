package com.web.ap_sports.dto.response.admin;

import com.web.ap_sports.dto.response.customer.UserResponse;
import com.web.ap_sports.dto.response.customer.OrderItemResponse;
import com.web.ap_sports.dto.response.customer.ShippingAddressResponse;
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
public class AdminOrderDetailResponse {
    private Long id;
    private String orderCode;
    private BigDecimal totalPrice;
    private BigDecimal shippingFee;
    private BigDecimal discountAmount;
    private BigDecimal finalAmount;
    private String status; // pending, confirmed, processing, shipping, delivered, canceled, payment_failed
    private String paymentMethod; // COD, VNPAY
    private String paymentStatus; // pending, completed, failed, refunded
    private String paymentUrl;
    private String couponCode;
    private String couponName;

    // Customer & Staff details
    private Long userId;
    private String customerName;
    private String customerEmail;
    private String customerPhone;
    private UserResponse processedByStaff;

    // Shipping Address & GPS
    private ShippingAddressResponse shippingAddress;
    private String trackingCode;
    private String shippingProvider;
    private Double gpsLatitude;
    private Double gpsLongitude;

    // GHN Station details
    private Integer ghnStationId;
    private String ghnStationName;
    private String ghnStationAddress;
    private Double ghnStationLatitude;
    private Double ghnStationLongitude;

    // Shipper & Delivery simulation coordinates for future embedded map & mobile app
    private Double shipperCurrentLatitude;
    private Double shipperCurrentLongitude;
    private String shipperName;
    private String shipperPhone;

    private String note;
    private List<OrderItemResponse> items;
    private List<OrderStatusHistoryResponse> statusHistories;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
