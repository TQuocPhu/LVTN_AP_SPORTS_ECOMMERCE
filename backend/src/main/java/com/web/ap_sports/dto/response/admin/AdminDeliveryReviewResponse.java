package com.web.ap_sports.dto.response.admin;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Response DTO chi tiết Đánh giá giao hàng dành cho Admin & Staff CSKH.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminDeliveryReviewResponse {
    private Long id;
    private Long orderId;
    private String orderCode;
    private String trackingCode;
    private String shippingProvider;

    private Long userId;
    private String customerName;
    private String customerEmail;
    private String customerAvatar;

    private Long shipperId;
    private String shipperName;
    private String shipperPhone;

    private Integer rating;
    private List<String> tags;
    private String comment;
    private String adminReply;
    private String repliedByName;
    private LocalDateTime repliedAt;
    private String status;
    private LocalDateTime createdAt;
}
