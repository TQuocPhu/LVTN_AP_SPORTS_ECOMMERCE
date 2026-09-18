package com.web.ap_sports.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WishlistStatusResponse {
    private Long productId;
    private Boolean isFavorite;
    private Long wishlistCount;
    private String message;
}
