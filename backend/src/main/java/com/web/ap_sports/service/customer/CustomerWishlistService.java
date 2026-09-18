package com.web.ap_sports.service.customer;

import com.web.ap_sports.dto.response.ApiResponse;
import com.web.ap_sports.dto.response.WishlistResponse;
import com.web.ap_sports.dto.response.WishlistStatusResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface CustomerWishlistService {

    WishlistStatusResponse toggleWishlist(Long userId, Long productId);

    ApiResponse<Void> addToWishlist(Long userId, Long productId);

    ApiResponse<Void> removeFromWishlist(Long userId, Long productId);

    Page<WishlistResponse> getUserWishlist(Long userId, Pageable pageable);

    List<Long> getUserWishlistProductIds(Long userId);

    WishlistStatusResponse checkWishlistStatus(Long userId, Long productId);
}
