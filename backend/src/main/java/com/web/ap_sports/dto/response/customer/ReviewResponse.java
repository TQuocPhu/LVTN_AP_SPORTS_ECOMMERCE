package com.web.ap_sports.dto.response.customer;

import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReviewResponse {
    private Long id;
    private String userName;
    private String userAvatar;
    private Integer rating;
    private String comment;
    private List<String> imageUrls;
    private String adminReply;
    private String repliedByName;
    private LocalDateTime repliedAt;
    private LocalDateTime createdAt;
    private boolean verifiedPurchase;
    private Long variantId;
    private String variantSku;
    private String variantColor;
    private String variantSize;
    private String variantSummary;
    private String attributes;
    private String variantAttributes;
}
