package com.web.ap_sports.controller.customer;

import com.web.ap_sports.dto.response.ApiResponse;
import com.web.ap_sports.dto.response.WishlistResponse;
import com.web.ap_sports.dto.response.WishlistStatusResponse;
import com.web.ap_sports.entity.User;
import com.web.ap_sports.exception.AppException;
import com.web.ap_sports.repository.UserRepository;
import com.web.ap_sports.service.customer.CustomerWishlistService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/customer/wishlist")
@RequiredArgsConstructor
public class CustomerWishlistController {

    private final CustomerWishlistService wishlistService;
    private final UserRepository userRepository;

    private User getAuthenticatedUser(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new AppException("Vui lòng đăng nhập để thực hiện thao tác này", HttpStatus.UNAUTHORIZED);
        }
        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new AppException("Người dùng không tồn tại", HttpStatus.NOT_FOUND));
    }

    /**
     * GET /api/v1/customer/wishlist: Lấy danh sách sản phẩm yêu thích (phân trang)
     */
    @GetMapping
    public ResponseEntity<ApiResponse<Page<WishlistResponse>>> getWishlist(
            Authentication authentication,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {
        User user = getAuthenticatedUser(authentication);
        Pageable pageable = PageRequest.of(page, size);
        Page<WishlistResponse> wishlist = wishlistService.getUserWishlist(user.getId(), pageable);
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách yêu thích thành công.", wishlist));
    }

    /**
     * POST /api/v1/customer/wishlist/toggle/{productId}: Bật / Tắt yêu thích
     */
    @PostMapping("/toggle/{productId}")
    public ResponseEntity<ApiResponse<WishlistStatusResponse>> toggleWishlist(
            Authentication authentication,
            @PathVariable Long productId) {
        User user = getAuthenticatedUser(authentication);
        WishlistStatusResponse response = wishlistService.toggleWishlist(user.getId(), productId);
        return ResponseEntity.ok(ApiResponse.success(response.getMessage(), response));
    }

    /**
     * POST /api/v1/customer/wishlist/{productId}: Thêm vào yêu thích
     */
    @PostMapping("/{productId}")
    public ResponseEntity<ApiResponse<Void>> addToWishlist(
            Authentication authentication,
            @PathVariable Long productId) {
        User user = getAuthenticatedUser(authentication);
        ApiResponse<Void> response = wishlistService.addToWishlist(user.getId(), productId);
        return ResponseEntity.ok(response);
    }

    /**
     * DELETE /api/v1/customer/wishlist/{productId}: Xóa khỏi yêu thích
     */
    @DeleteMapping("/{productId}")
    public ResponseEntity<ApiResponse<Void>> removeFromWishlist(
            Authentication authentication,
            @PathVariable Long productId) {
        User user = getAuthenticatedUser(authentication);
        ApiResponse<Void> response = wishlistService.removeFromWishlist(user.getId(), productId);
        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/v1/customer/wishlist/ids: Lấy danh sách Product IDs đã yêu thích
     */
    @GetMapping("/ids")
    public ResponseEntity<ApiResponse<List<Long>>> getWishlistProductIds(Authentication authentication) {
        User user = getAuthenticatedUser(authentication);
        List<Long> productIds = wishlistService.getUserWishlistProductIds(user.getId());
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách ID yêu thích thành công.", productIds));
    }

    /**
     * GET /api/v1/customer/wishlist/check/{productId}: Kiểm tra sản phẩm có trong yêu thích không
     */
    @GetMapping("/check/{productId}")
    public ResponseEntity<ApiResponse<WishlistStatusResponse>> checkWishlistStatus(
            Authentication authentication,
            @PathVariable Long productId) {
        User user = getAuthenticatedUser(authentication);
        WishlistStatusResponse response = wishlistService.checkWishlistStatus(user.getId(), productId);
        return ResponseEntity.ok(ApiResponse.success("Kiểm tra trạng thái thành công.", response));
    }
}
