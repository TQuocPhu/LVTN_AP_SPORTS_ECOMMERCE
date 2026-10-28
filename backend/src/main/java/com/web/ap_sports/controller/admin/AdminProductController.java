package com.web.ap_sports.controller.admin;

import com.web.ap_sports.dto.request.admin.CreateProductRequest;
import com.web.ap_sports.dto.request.admin.UpdateProductRequest;
import com.web.ap_sports.dto.request.common.ProductFilterRequest;
import com.web.ap_sports.dto.response.ApiResponse;
import com.web.ap_sports.dto.response.common.ProductDetailResponse;
import com.web.ap_sports.dto.response.common.ProductResponse;
import com.web.ap_sports.dto.response.common.VariantResponse;
import com.web.ap_sports.service.admin.AdminProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin/products")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('MANAGE_PRODUCTS') or hasAnyRole('ADMIN', 'STAFF', 'WAREHOUSE_MANAGER')")
public class AdminProductController {

    private final AdminProductService adminProductService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<ProductResponse>>> getProducts(
            @ModelAttribute ProductFilterRequest filterRequest) {
        Page<ProductResponse> page = adminProductService.getProducts(filterRequest);
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách sản phẩm thành công.", page));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductDetailResponse>> getProductById(@PathVariable("id") Long id) {
        ProductDetailResponse product = adminProductService.getProductById(id);
        return ResponseEntity.ok(ApiResponse.success("Lấy chi tiết sản phẩm thành công.", product));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ProductDetailResponse>> createProduct(
            Authentication authentication,
            @Valid @RequestBody CreateProductRequest request) {
        String currentUserEmail = (authentication != null) ? authentication.getName() : null;
        ProductDetailResponse created = adminProductService.createProduct(request, currentUserEmail);
        return ResponseEntity.ok(ApiResponse.success("Thêm sản phẩm thành công.", created));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductDetailResponse>> updateProduct(
            @PathVariable("id") Long id,
            @Valid @RequestBody UpdateProductRequest request) {
        ProductDetailResponse updated = adminProductService.updateProduct(id, request);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật sản phẩm thành công.", updated));
    }

    @PatchMapping("/{id}/toggle-status")
    public ResponseEntity<ApiResponse<ProductResponse>> toggleProductStatus(@PathVariable("id") Long id) {
        ProductResponse updated = adminProductService.toggleProductStatus(id);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật trạng thái sản phẩm thành công.", updated));
    }

    @PatchMapping("/{productId}/variants/{variantId}/toggle-status")
    public ResponseEntity<ApiResponse<VariantResponse>> toggleVariantStatus(
            @PathVariable("productId") Long productId,
            @PathVariable("variantId") Long variantId) {
        VariantResponse updated = adminProductService.toggleVariantStatus(productId, variantId);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật trạng thái biến thể thành công.", updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteProduct(@PathVariable("id") Long id) {
        adminProductService.deleteProduct(id);
        return ResponseEntity.ok(ApiResponse.success("Xóa sản phẩm thành công."));
    }
}
