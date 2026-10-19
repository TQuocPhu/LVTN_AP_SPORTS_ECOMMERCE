package com.web.ap_sports.dto.response.support;

import lombok.*;
import java.time.LocalDateTime;

/**
 * DTO phản hồi thông tin đăng ký nhận thông báo hàng về.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RestockNotificationResponse {

    private Long id;
    private Long userId;
    private Long productId;
    private String productName;
    private String productSlug;
    private Long variantId;
    private String variantName;
    private String sku;
    private String size;
    private String color;
    private String email;
    private String status;
    private String message;
    private LocalDateTime createdAt;
    private LocalDateTime notifiedAt;
}
