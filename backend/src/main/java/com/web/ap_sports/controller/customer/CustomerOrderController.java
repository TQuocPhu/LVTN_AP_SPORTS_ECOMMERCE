package com.web.ap_sports.controller.customer;

import com.web.ap_sports.dto.request.customer.CreateOrderRequest;
import com.web.ap_sports.dto.response.ApiResponse;
import com.web.ap_sports.dto.response.customer.OrderResponse;
import com.web.ap_sports.entity.User;
import com.web.ap_sports.exception.AppException;
import com.web.ap_sports.repository.UserRepository;
import com.web.ap_sports.service.customer.CustomerOrderService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/customer/orders")
@RequiredArgsConstructor
public class CustomerOrderController {

    private final CustomerOrderService orderService;
    private final UserRepository userRepository;

    private User getAuthenticatedUser(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new AppException("Vui lòng đăng nhập để thực hiện thao tác này", HttpStatus.UNAUTHORIZED);
        }
        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new AppException("Người dùng không tồn tại", HttpStatus.NOT_FOUND));
    }

    private String getClientIp(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isBlank()) {
            return xForwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }

    @PostMapping
    public ResponseEntity<ApiResponse<OrderResponse>> createOrder(
            Authentication authentication,
            @Valid @RequestBody CreateOrderRequest request,
            HttpServletRequest servletRequest) {
        User user = getAuthenticatedUser(authentication);
        String clientIp = getClientIp(servletRequest);
        OrderResponse response = orderService.createOrder(user.getEmail(), request, clientIp);
        return ResponseEntity.ok(ApiResponse.success("Đặt hàng thành công", response));
    }

    @GetMapping("/vnpay-return")
    public ResponseEntity<ApiResponse<OrderResponse>> processVNPayReturn(
            @RequestParam Map<String, String> queryParams) {
        OrderResponse response = orderService.processVNPayReturn(queryParams);
        return ResponseEntity.ok(ApiResponse.success("Xử lý kết quả thanh toán VNPay thành công", response));
    }

    @PostMapping("/{orderCode}/retry-vnpay")
    public ResponseEntity<ApiResponse<OrderResponse>> retryVNPayPayment(
            Authentication authentication,
            @PathVariable String orderCode,
            HttpServletRequest servletRequest) {
        User user = getAuthenticatedUser(authentication);
        String clientIp = getClientIp(servletRequest);
        OrderResponse response = orderService.retryVNPayPayment(user.getEmail(), orderCode, clientIp);
        return ResponseEntity.ok(ApiResponse.success("Khởi tạo lại liên kết thanh toán VNPay thành công", response));
    }

    @GetMapping("/my-orders")
    public ResponseEntity<ApiResponse<Page<OrderResponse>>> getMyOrders(
            Authentication authentication,
            @RequestParam(required = false, defaultValue = "ALL") String status,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false, defaultValue = "createdAt") String sortBy,
            @RequestParam(required = false, defaultValue = "DESC") String sortDir,
            @PageableDefault(size = 10) Pageable pageable) {
        User user = getAuthenticatedUser(authentication);
        Page<OrderResponse> orders = orderService.getMyOrders(user.getEmail(), status, keyword, sortBy, sortDir, pageable);
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách đơn hàng thành công", orders));
    }

    @GetMapping("/{orderCode}")
    public ResponseEntity<ApiResponse<OrderResponse>> getOrderByCode(
            Authentication authentication,
            @PathVariable String orderCode) {
        User user = getAuthenticatedUser(authentication);
        OrderResponse response = orderService.getOrderByCode(user.getEmail(), orderCode);
        return ResponseEntity.ok(ApiResponse.success("Lấy chi tiết đơn hàng thành công", response));
    }

    @PutMapping("/{orderCode}/cancel")
    public ResponseEntity<ApiResponse<OrderResponse>> cancelMyOrder(
            Authentication authentication,
            @PathVariable String orderCode,
            @RequestBody(required = false) Map<String, String> body) {
        User user = getAuthenticatedUser(authentication);
        String reason = body != null ? body.get("reason") : null;
        OrderResponse response = orderService.cancelMyOrder(user.getEmail(), orderCode, reason);
        return ResponseEntity.ok(ApiResponse.success("Hủy đơn hàng thành công", response));
    }

    @PutMapping("/{orderCode}/return")
    public ResponseEntity<ApiResponse<OrderResponse>> returnMyOrder(
            Authentication authentication,
            @PathVariable String orderCode,
            @RequestBody(required = false) Map<String, String> body) {
        User user = getAuthenticatedUser(authentication);
        String reason = body != null ? body.get("reason") : null;
        OrderResponse response = orderService.returnMyOrder(user.getEmail(), orderCode, reason);
        return ResponseEntity.ok(ApiResponse.success("Gửi yêu cầu trả hàng thành công", response));
    }
}
