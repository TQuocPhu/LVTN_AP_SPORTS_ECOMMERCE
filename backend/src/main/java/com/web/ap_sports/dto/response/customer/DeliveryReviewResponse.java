package com.web.ap_sports.dto.response.customer;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Response DTO hiển thị đánh giá giao hàng phía Khách hàng (Web & Mobile).
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DeliveryReviewResponse {
    private Long id;
    private Long orderId;
    private String orderCode;
    private String shipperName;
    private String shipperPhone;
    private String shippingProvider;
    private String trackingCode;
    private Integer rating;
    private List<String> tags;
    private String comment;
    private String adminReply;
    private String repliedByName;
    private LocalDateTime repliedAt;
    private String status;
    private LocalDateTime createdAt;
}
