package com.web.ap_sports.controller.customer;

import com.web.ap_sports.dto.request.customer.AddToCartRequest;
import com.web.ap_sports.dto.request.customer.UpdateCartItemRequest;
import com.web.ap_sports.dto.response.ApiResponse;
import com.web.ap_sports.dto.response.customer.CartItemResponse;
import com.web.ap_sports.dto.response.customer.CartSummaryResponse;
import com.web.ap_sports.entity.User;
import com.web.ap_sports.exception.AppException;
import com.web.ap_sports.repository.UserRepository;
import com.web.ap_sports.service.customer.CustomerCartService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/customer/cart")
@RequiredArgsConstructor
public class CustomerCartController {

    private final CustomerCartService cartService;
    private final UserRepository userRepository;

    private User getAuthenticatedUser(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new AppException("Vui lòng đăng nhập để sử dụng giỏ hàng", HttpStatus.UNAUTHORIZED);
        }
        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new AppException("Người dùng không tồn tại", HttpStatus.NOT_FOUND));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<CartSummaryResponse>> getCart(Authentication authentication) {
        User user = getAuthenticatedUser(authentication);
        CartSummaryResponse cart = cartService.getCart(user.getId());
        return ResponseEntity.ok(ApiResponse.success("Lấy thông tin giỏ hàng thành công", cart));
    }

    @PostMapping("/items")
    public ResponseEntity<ApiResponse<CartItemResponse>> addToCart(
            Authentication authentication,
            @Valid @RequestBody AddToCartRequest request) {
        User user = getAuthenticatedUser(authentication);
        CartItemResponse item = cartService.addToCart(user.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Đã thêm sản phẩm vào giỏ hàng", item));
    }

    @PutMapping("/items/{id}")
    public ResponseEntity<ApiResponse<CartItemResponse>> updateCartItem(
            Authentication authentication,
            @PathVariable Long id,
            @Valid @RequestBody UpdateCartItemRequest request) {
        User user = getAuthenticatedUser(authentication);
        CartItemResponse item = cartService.updateCartItem(user.getId(), id, request);
        return ResponseEntity.ok(ApiResponse.success("Đã cập nhật số lượng", item));
    }

    @DeleteMapping("/items/{id}")
    public ResponseEntity<ApiResponse<Void>> removeCartItem(
            Authentication authentication,
            @PathVariable Long id) {
        User user = getAuthenticatedUser(authentication);
        cartService.removeCartItem(user.getId(), id);
        return ResponseEntity.ok(ApiResponse.success("Đã xóa sản phẩm khỏi giỏ hàng", null));
    }

    @DeleteMapping("/items")
    public ResponseEntity<ApiResponse<Void>> clearCart(Authentication authentication) {
        User user = getAuthenticatedUser(authentication);
        cartService.clearCart(user.getId());
        return ResponseEntity.ok(ApiResponse.success("Đã dọn dẹp giỏ hàng", null));
    }

    @PatchMapping("/items/{id}/select")
    public ResponseEntity<ApiResponse<CartItemResponse>> toggleSelectItem(
            Authentication authentication,
            @PathVariable Long id) {
        User user = getAuthenticatedUser(authentication);
        CartItemResponse item = cartService.toggleSelectItem(user.getId(), id);
        return ResponseEntity.ok(ApiResponse.success("Đã thay đổi trạng thái chọn sản phẩm", item));
    }

    @PatchMapping("/select-all")
    public ResponseEntity<ApiResponse<Void>> toggleSelectAll(
            Authentication authentication,
            @RequestParam boolean isSelected) {
        User user = getAuthenticatedUser(authentication);
        cartService.toggleSelectAll(user.getId(), isSelected);
        return ResponseEntity.ok(ApiResponse.success("Đã thay đổi trạng thái chọn tất cả", null));
    }
}
