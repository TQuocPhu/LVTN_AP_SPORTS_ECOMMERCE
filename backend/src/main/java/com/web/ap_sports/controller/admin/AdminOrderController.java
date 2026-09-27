package com.web.ap_sports.controller.admin;

import com.web.ap_sports.dto.request.admin.AdminOrderFilterRequest;
import com.web.ap_sports.dto.request.admin.CancelOrderRequest;
import com.web.ap_sports.dto.request.admin.UpdateOrderStatusRequest;
import com.web.ap_sports.dto.response.ApiResponse;
import com.web.ap_sports.dto.response.admin.AdminOrderDetailResponse;
import com.web.ap_sports.dto.response.admin.AdminOrderSummaryResponse;
import com.web.ap_sports.service.admin.AdminOrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin/orders")
@RequiredArgsConstructor
@Slf4j
@PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
public class AdminOrderController {

    private final AdminOrderService adminOrderService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<AdminOrderDetailResponse>>> getAdminOrders(
            @ModelAttribute AdminOrderFilterRequest filterRequest) {
        log.info("REST request truy vấn danh sách đơn hàng Admin/Staff: {}", filterRequest);
        Page<AdminOrderDetailResponse> response = adminOrderService.getAdminOrders(filterRequest);
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách đơn hàng quản trị thành công!", response));
    }

    @GetMapping("/summary")
    public ResponseEntity<ApiResponse<AdminOrderSummaryResponse>> getOrderSummary() {
        log.info("REST request lấy báo cáo KPI đơn hàng Admin/Staff");
        AdminOrderSummaryResponse summary = adminOrderService.getOrderSummary();
        return ResponseEntity.ok(ApiResponse.success("Lấy báo cáo KPI đơn hàng thành công!", summary));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<AdminOrderDetailResponse>> getAdminOrderById(@PathVariable Long id) {
        log.info("REST request lấy chi tiết đơn hàng ID #{}", id);
        AdminOrderDetailResponse detail = adminOrderService.getAdminOrderById(id);
        return ResponseEntity.ok(ApiResponse.success("Lấy chi tiết đơn hàng thành công!", detail));
    }

    @GetMapping("/code/{orderCode}")
    public ResponseEntity<ApiResponse<AdminOrderDetailResponse>> getAdminOrderByCode(@PathVariable String orderCode) {
        log.info("REST request lấy chi tiết đơn hàng mã #{}", orderCode);
        AdminOrderDetailResponse detail = adminOrderService.getAdminOrderByCode(orderCode);
        return ResponseEntity.ok(ApiResponse.success("Lấy chi tiết đơn hàng thành công!", detail));
    }

    @PutMapping("/{id}/confirm")
    public ResponseEntity<ApiResponse<AdminOrderDetailResponse>> confirmOrder(
            @PathVariable Long id,
            Authentication authentication) {
        String staffEmail = authentication.getName();
        log.info("Nhân viên [{}] gửi yêu cầu xác nhận đơn hàng ID #{}", staffEmail, id);
        AdminOrderDetailResponse response = adminOrderService.confirmOrder(id, staffEmail);
        return ResponseEntity.ok(ApiResponse.success("Xác nhận đơn hàng thành công!", response));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<ApiResponse<AdminOrderDetailResponse>> updateOrderStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateOrderStatusRequest request,
            Authentication authentication) {
        String staffEmail = authentication.getName();
        log.info("Nhân viên [{}] cập nhật trạng thái đơn hàng ID #{} sang [{}]", staffEmail, id, request.getStatus());
        AdminOrderDetailResponse response = adminOrderService.updateOrderStatus(id, request, staffEmail);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật trạng thái đơn hàng thành công!", response));
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<AdminOrderDetailResponse>> cancelOrder(
            @PathVariable Long id,
            @Valid @RequestBody CancelOrderRequest request,
            Authentication authentication) {
        String staffEmail = authentication.getName();
        log.info("Nhân viên [{}] gửi yêu cầu hủy đơn hàng ID #{} với lý do: {}", staffEmail, id, request.getReason());
        AdminOrderDetailResponse response = adminOrderService.cancelOrder(id, request, staffEmail);
        return ResponseEntity.ok(ApiResponse.success("Hủy đơn hàng thành công!", response));
    }
}
