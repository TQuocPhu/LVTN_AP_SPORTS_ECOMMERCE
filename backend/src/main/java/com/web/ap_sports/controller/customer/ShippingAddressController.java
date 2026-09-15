package com.web.ap_sports.controller.customer;

import com.web.ap_sports.dto.request.customer.ShippingAddressRequest;
import com.web.ap_sports.dto.response.ApiResponse;
import com.web.ap_sports.dto.response.customer.ShippingAddressResponse;
import com.web.ap_sports.service.customer.ShippingAddressService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST Controller xử lý Địa chỉ giao hàng của Khách hàng (/api/v1/customer/addresses).
 */
@RestController
@RequestMapping("/api/v1/customer/addresses")
@RequiredArgsConstructor
public class ShippingAddressController {

    private final ShippingAddressService shippingAddressService;

    /**
     * Lấy danh sách địa chỉ giao hàng.
     * GET /api/v1/customer/addresses
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<ShippingAddressResponse>>> getAddresses(Authentication authentication) {
        List<ShippingAddressResponse> list = shippingAddressService.getAddresses(authentication.getName());
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách địa chỉ giao hàng thành công.", list));
    }

    /**
     * Thêm địa chỉ giao hàng mới.
     * POST /api/v1/customer/addresses
     */
    @PostMapping
    public ResponseEntity<ApiResponse<ShippingAddressResponse>> createAddress(
            Authentication authentication,
            @Valid @RequestBody ShippingAddressRequest request) {
        ShippingAddressResponse created = shippingAddressService.createAddress(authentication.getName(), request);
        return ResponseEntity.ok(ApiResponse.success("Thêm địa chỉ giao hàng thành công.", created));
    }

    /**
     * Cập nhật địa chỉ giao hàng.
     * PUT /api/v1/customer/addresses/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ShippingAddressResponse>> updateAddress(
            Authentication authentication,
            @PathVariable("id") Long id,
            @Valid @RequestBody ShippingAddressRequest request) {
        ShippingAddressResponse updated = shippingAddressService.updateAddress(authentication.getName(), id, request);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật địa chỉ giao hàng thành công.", updated));
    }

    /**
     * Xóa địa chỉ giao hàng.
     * DELETE /api/v1/customer/addresses/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteAddress(
            Authentication authentication,
            @PathVariable("id") Long id) {
        shippingAddressService.deleteAddress(authentication.getName(), id);
        return ResponseEntity.ok(ApiResponse.success("Xóa địa chỉ giao hàng thành công."));
    }

    /**
     * Đặt địa chỉ làm mặc định.
     * PATCH /api/v1/customer/addresses/{id}/default
     */
    @PatchMapping("/{id}/default")
    public ResponseEntity<ApiResponse<ShippingAddressResponse>> setDefaultAddress(
            Authentication authentication,
            @PathVariable("id") Long id) {
        ShippingAddressResponse updated = shippingAddressService.setDefaultAddress(authentication.getName(), id);
        return ResponseEntity.ok(ApiResponse.success("Đặt địa chỉ mặc định thành công.", updated));
    }
}
