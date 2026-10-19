package com.web.ap_sports.controller.warehouse;

import com.web.ap_sports.dto.request.warehouse.VerifyOrderPackRequest;
import com.web.ap_sports.dto.response.ApiResponse;
import com.web.ap_sports.dto.response.admin.AdminOrderDetailResponse;
import com.web.ap_sports.service.warehouse.WarehouseFulfillmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST Controller cho bộ phận quản lý kho kiểm đếm Barcode và đóng gói xuất kho đơn hàng (WMS Fulfillment).
 */
@RestController
@RequestMapping("/api/v1/warehouse/fulfillment")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('MANAGE_INVENTORY') or hasRole('ADMIN') or hasRole('WAREHOUSE_MANAGER') or hasRole('STAFF')")
public class WarehouseFulfillmentController {

    private final WarehouseFulfillmentService fulfillmentService;

    /**
     * POST /api/v1/warehouse/fulfillment/orders/{orderId}/verify-pack: Xác nhận kiểm đếm Barcode 100% và đóng gói
     */
    @PostMapping("/orders/{orderId}/verify-pack")
    public ResponseEntity<ApiResponse<AdminOrderDetailResponse>> verifyOrderPack(
            @PathVariable Long orderId,
            @Valid @RequestBody VerifyOrderPackRequest request,
            Authentication authentication) {
        AdminOrderDetailResponse response = fulfillmentService.verifyOrderPack(orderId, request, authentication.getName());
        return ResponseEntity.ok(ApiResponse.success("Kiểm đếm Barcode và đóng gói đơn hàng thành công!", response));
    }

    /**
     * GET /api/v1/warehouse/fulfillment/orders/pending-packing: Lấy danh sách các đơn hàng đã duyệt đang chờ kho đóng gói
     */
    @GetMapping("/orders/pending-packing")
    public ResponseEntity<ApiResponse<List<AdminOrderDetailResponse>>> getOrdersPendingPacking() {
        List<AdminOrderDetailResponse> list = fulfillmentService.getOrdersPendingPacking();
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách đơn hàng chờ đóng gói thành công.", list));
    }
}
