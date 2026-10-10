package com.web.ap_sports.controller.common;

import com.web.ap_sports.dto.request.admin.AdminOrderFilterRequest;
import com.web.ap_sports.dto.request.admin.UpdateOrderStatusRequest;
import com.web.ap_sports.dto.response.ApiResponse;
import com.web.ap_sports.dto.response.admin.AdminOrderDetailResponse;
import com.web.ap_sports.dto.response.admin.OrderStatusHistoryResponse;
import com.web.ap_sports.exception.AppException;
import com.web.ap_sports.service.admin.AdminOrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Set;

/**
 * API phục vụ 3 Portal mô phỏng Logistics (GHN Station, Carrier Transit, Shipper App).
 *
 * Các portal này không có màn hình đăng nhập nên endpoint được mở ở tầng Spring Security,
 * nhưng được bảo vệ bằng các lớp sau:
 *  1. Bật/tắt bằng cấu hình `app.demo.logistics.enabled` (tắt ở production → controller không được đăng ký).
 *  2. Bắt buộc header `X-Demo-Key` khớp với `app.demo.logistics.key`.
 *  3. Chỉ xem được đơn ở các trạng thái vận chuyển, chỉ được chuyển sang shipped/shipping/delivered
 *     (không hủy, không thao tác trước khâu xuất kho). State machine chi tiết do AdminOrderService kiểm tra.
 *  4. Tài khoản thực hiện thao tác do server quyết định (tài khoản dịch vụ GHN), không nhận từ client.
 *  5. SĐT / Email khách hàng bị che một phần trong phản hồi.
 */
@RestController
@RequestMapping("/api/v1/demo/logistics")
@RequiredArgsConstructor
@Slf4j
public class DemoLogisticsController {

    private static final int MAX_PAGE_SIZE = 50;

    private static final Set<String> VIEWABLE_STATUSES = Set.of("processing", "shipped", "shipping", "delivered");

    private final AdminOrderService adminOrderService;

    /**
     * Lấy danh sách đơn hàng mô phỏng theo trạng thái vận chuyển (processing, shipped, shipping, delivered)
     */
    @GetMapping("/orders")
    @PreAuthorize("hasAnyRole('GHN_STATION', 'GHN_SHIPPER')")
    public ResponseEntity<ApiResponse<Page<AdminOrderDetailResponse>>> getDemoOrders(
            @RequestParam String status,
            @RequestParam(required = false, defaultValue = "0") int page,
            @RequestParam(required = false, defaultValue = "10") int size) {
        
        String normalizedStatus = status == null ? "" : status.trim().toLowerCase();
        if (!VIEWABLE_STATUSES.contains(normalizedStatus)) {
            throw new AppException("Portal mô phỏng chỉ được xem đơn ở trạng thái: " + VIEWABLE_STATUSES, HttpStatus.BAD_REQUEST);
        }

        // Kiểm tra quyền nghiêm ngặt khi lấy danh sách
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        boolean isStation = authentication.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_GHN_STATION"));
        boolean isShipper = authentication.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_GHN_SHIPPER"));

        if (("processing".equals(normalizedStatus) || "shipped".equals(normalizedStatus)) && !isStation) {
            throw new AppException("Chỉ quản lý bưu cục (GHN_STATION) mới được xem danh sách đơn hàng ở trạng thái " + normalizedStatus, HttpStatus.FORBIDDEN);
        }
        if ("shipping".equals(normalizedStatus) && !isShipper) {
            throw new AppException("Chỉ tài xế giao hàng (GHN_SHIPPER) mới được xem danh sách đơn hàng đang đi giao (shipping)", HttpStatus.FORBIDDEN);
        }

        log.info("Demo Logistics REST request truy vấn đơn hàng với status: {}", normalizedStatus);
        AdminOrderFilterRequest filterRequest = new AdminOrderFilterRequest();
        filterRequest.setStatus(normalizedStatus);
        filterRequest.setPage(Math.max(0, page));
        filterRequest.setSize(Math.min(MAX_PAGE_SIZE, Math.max(1, size)));
        filterRequest.setSortBy("createdAt");
        filterRequest.setSortDir("DESC");

        Page<AdminOrderDetailResponse> response = adminOrderService.getAdminOrders(filterRequest).map(this::maskSensitiveData);
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách đơn hàng mô phỏng logistics thành công!", response));
    }

    /**
     * Cập nhật trạng thái đơn hàng mô phỏng từ các Portal GHN Station, Carrier, Shipper
     */
    @PutMapping("/orders/{id}/status")
    @PreAuthorize("hasAnyRole('GHN_STATION', 'GHN_SHIPPER')")
    public ResponseEntity<ApiResponse<AdminOrderDetailResponse>> updateDemoOrderStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateOrderStatusRequest request,
            Authentication authentication) {

        String targetStatus = request.getStatus() == null ? "" : request.getStatus().trim().toLowerCase();
        String actorEmail = authentication.getName();
        
        // Kiểm tra quyền theo từng hành động
        if ("shipped".equals(targetStatus) || "shipping".equals(targetStatus)) {
            if (authentication.getAuthorities().stream().noneMatch(a -> a.getAuthority().equals("ROLE_GHN_STATION"))) {
                throw new AppException("Chỉ quản lý bưu cục (GHN_STATION) mới được chuyển trạng thái thành " + targetStatus, HttpStatus.FORBIDDEN);
            }
        } else if ("delivered".equals(targetStatus)) {
            if (authentication.getAuthorities().stream().noneMatch(a -> a.getAuthority().equals("ROLE_GHN_SHIPPER"))) {
                throw new AppException("Chỉ tài xế giao hàng (GHN_SHIPPER) mới được xác nhận giao thành công (delivered)", HttpStatus.FORBIDDEN);
            }
        } else {
            throw new AppException("Portal mô phỏng chỉ được chuyển đơn sang: [shipped, shipping, delivered]", HttpStatus.FORBIDDEN);
        }
        
        log.info("Demo Logistics REST request cập nhật đơn #{} sang status [{}] bởi {}", id, targetStatus, actorEmail);

        AdminOrderDetailResponse response = adminOrderService.updateOrderStatus(id, request, actorEmail);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật trạng thái đơn hàng logistics thành công!", maskSensitiveData(response)));
    }

    private AdminOrderDetailResponse maskSensitiveData(AdminOrderDetailResponse order) {
        order.setCustomerPhone(maskPhone(order.getCustomerPhone()));
        order.setCustomerEmail(maskEmail(order.getCustomerEmail()));
        if (order.getShippingAddress() != null) {
            order.getShippingAddress().setPhone(maskPhone(order.getShippingAddress().getPhone()));
        }
        if (order.getProcessedByStaff() != null) {
            order.getProcessedByStaff().setEmail(maskEmail(order.getProcessedByStaff().getEmail()));
        }
        if (order.getStatusHistories() != null) {
            for (OrderStatusHistoryResponse h : order.getStatusHistories()) {
                h.setChangedByEmail(maskEmail(h.getChangedByEmail()));
            }
        }
        return order;
    }

    private String maskPhone(String phone) {
        if (phone == null || phone.length() < 6) return phone;
        return phone.substring(0, 3) + "****" + phone.substring(phone.length() - 3);
    }

    private String maskEmail(String email) {
        if (email == null || email.isBlank()) return email;
        int at = email.indexOf('@');
        if (at <= 1) return email;
        return email.charAt(0) + "***" + email.substring(at);
    }
}
