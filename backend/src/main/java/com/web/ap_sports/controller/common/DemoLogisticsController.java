package com.web.ap_sports.controller.common;

import com.web.ap_sports.dto.request.admin.AdminOrderFilterRequest;
import com.web.ap_sports.dto.request.admin.UpdateOrderStatusRequest;
import com.web.ap_sports.dto.response.ApiResponse;
import com.web.ap_sports.dto.response.admin.AdminOrderDetailResponse;
import com.web.ap_sports.service.admin.AdminOrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/demo/logistics")
@RequiredArgsConstructor
@Slf4j
public class DemoLogisticsController {

    private final AdminOrderService adminOrderService;

    /**
     * Lấy danh sách đơn hàng mô phỏng theo trạng thái (processing, shipped, shipping...)
     */
    @GetMapping("/orders")
    public ResponseEntity<ApiResponse<Page<AdminOrderDetailResponse>>> getDemoOrders(
            @RequestParam(required = false, defaultValue = "ALL") String status,
            @RequestParam(required = false, defaultValue = "0") int page,
            @RequestParam(required = false, defaultValue = "10") int size) {
        log.info("Demo Logistics REST request truy vấn đơn hàng với status: {}", status);
        AdminOrderFilterRequest filterRequest = new AdminOrderFilterRequest();
        filterRequest.setStatus(status);
        filterRequest.setPage(page);
        filterRequest.setSize(size);
        filterRequest.setSortBy("createdAt");
        filterRequest.setSortDir("DESC");

        Page<AdminOrderDetailResponse> response = adminOrderService.getAdminOrders(filterRequest);
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách đơn hàng mô phỏng logistics thành công!", response));
    }

    /**
     * Cập nhật trạng thái đơn hàng mô phỏng từ các Portal GHN Station, Carrier, Shipper
     */
    @PutMapping("/orders/{id}/status")
    public ResponseEntity<ApiResponse<AdminOrderDetailResponse>> updateDemoOrderStatus(
            @PathVariable Long id,
            @RequestParam(required = false) String updatedByEmail,
            @Valid @RequestBody UpdateOrderStatusRequest request) {
        log.info("Demo Logistics REST request cập nhật đơn #{} sang status [{}]", id, request.getStatus());
        
        String emailToUse = updatedByEmail;
        if (emailToUse == null || emailToUse.isBlank()) {
            if ("delivered".equalsIgnoreCase(request.getStatus())) {
                emailToUse = "ghn_shipper@apsports.com";
            } else {
                emailToUse = "ghn_station@apsports.com";
            }
        }

        AdminOrderDetailResponse response = adminOrderService.updateOrderStatus(id, request, emailToUse);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật trạng thái đơn hàng logistics thành công!", response));
    }
}
