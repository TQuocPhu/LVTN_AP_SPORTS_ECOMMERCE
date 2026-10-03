package com.web.ap_sports.dto.response.admin;

import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminReviewDetailResponse {
    private Long id;
    private Long userId;
    private String userName;
    private String userEmail;
    private Long productId;
    private String productName;
    private String productImage;
    private Long orderItemId;
    private Integer rating;
    private String comment;
    private List<String> imageUrls;
    private String adminReply;
    private String repliedByName;
    private LocalDateTime repliedAt;
    private String status;
    private LocalDateTime createdAt;
}
