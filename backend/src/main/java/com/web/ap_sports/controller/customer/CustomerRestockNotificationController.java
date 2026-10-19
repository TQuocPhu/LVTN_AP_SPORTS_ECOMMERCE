package com.web.ap_sports.controller.customer;

import com.web.ap_sports.dto.request.support.RegisterRestockNotificationRequest;
import com.web.ap_sports.dto.response.ApiResponse;
import com.web.ap_sports.dto.response.support.RestockNotificationResponse;
import com.web.ap_sports.entity.User;
import com.web.ap_sports.exception.AppException;
import com.web.ap_sports.repository.UserRepository;
import com.web.ap_sports.service.customer.ProductRestockNotificationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * REST Controller cho khách hàng đăng ký và quản lý thông báo hàng về kho (Restock Alert).
 */
@RestController
@RequestMapping("/api/v1/customer/restock-notifications")
@RequiredArgsConstructor
public class CustomerRestockNotificationController {

    private final ProductRestockNotificationService restockNotificationService;
    private final UserRepository userRepository;

    private User getAuthenticatedUser(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equalsIgnoreCase(authentication.getName())) {
            throw new AppException("Vui lòng đăng nhập để đăng ký nhận thông báo khi có hàng về kho", HttpStatus.UNAUTHORIZED);
        }
        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new AppException("Người dùng không tồn tại trong hệ thống", HttpStatus.NOT_FOUND));
    }

    /**
     * POST /api/v1/customer/restock-notifications: Đăng ký nhận thông báo cho biến thể sản phẩm
     */
    @PostMapping
    public ResponseEntity<ApiResponse<RestockNotificationResponse>> registerNotification(
            Authentication authentication,
            @Valid @RequestBody RegisterRestockNotificationRequest request) {
        User user = getAuthenticatedUser(authentication);
        RestockNotificationResponse response = restockNotificationService.registerNotification(user.getId(), request);
        return ResponseEntity.ok(ApiResponse.success(response.getMessage(), response));
    }

    /**
     * DELETE /api/v1/customer/restock-notifications/{variantId}: Hủy đăng ký nhận thông báo
     */
    @DeleteMapping("/{variantId}")
    public ResponseEntity<ApiResponse<Void>> cancelNotification(
            Authentication authentication,
            @PathVariable Long variantId) {
        User user = getAuthenticatedUser(authentication);
        ApiResponse<Void> response = restockNotificationService.cancelNotification(user.getId(), variantId);
        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/v1/customer/restock-notifications/check/{variantId}: Kiểm tra trạng thái đã đăng ký chưa
     */
    @GetMapping("/check/{variantId}")
    public ResponseEntity<ApiResponse<Map<String, Boolean>>> checkSubscription(
            Authentication authentication,
            @PathVariable Long variantId) {
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equalsIgnoreCase(authentication.getName())) {
            return ResponseEntity.ok(ApiResponse.success("Chưa đăng nhập", Map.of("subscribed", false)));
        }

        return userRepository.findByEmail(authentication.getName())
                .map(user -> {
                    boolean subscribed = restockNotificationService.isSubscribed(user.getId(), variantId);
                    return ResponseEntity.ok(ApiResponse.success("Kiểm tra trạng thái đăng ký thành công", Map.of("subscribed", subscribed)));
                })
                .orElseGet(() -> ResponseEntity.ok(ApiResponse.success("Chưa đăng ký", Map.of("subscribed", false))));
    }
}
