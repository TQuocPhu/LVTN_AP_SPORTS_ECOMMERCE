package com.web.ap_sports.dto.request.admin;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminOrderFilterRequest {
    private String keyword;
    private String status; // ALL, pending, confirmed, processing, shipping, delivered, cancelled, payment_failed
    private String paymentMethod; // ALL, COD, VNPAY
    private BigDecimal minPrice;
    private BigDecimal maxPrice;
    private String startDate; // yyyy-MM-dd HH:mm:ss hoặc yyyy-MM-dd
    private String endDate;
    @Builder.Default
    private Integer page = 0;
    @Builder.Default
    private Integer size = 10;
    @Builder.Default
    private String sortBy = "createdAt";
    @Builder.Default
    private String sortDir = "DESC";
}
