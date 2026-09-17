package com.web.ap_sports.controller.customer;

import com.web.ap_sports.dto.request.common.ProductFilterRequest;
import com.web.ap_sports.dto.response.ApiResponse;
import com.web.ap_sports.dto.response.common.ProductDetailResponse;
import com.web.ap_sports.dto.response.common.ProductResponse;
import com.web.ap_sports.service.customer.CustomerProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/products")
@RequiredArgsConstructor
public class CustomerProductController {

    private final CustomerProductService customerProductService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<ProductResponse>>> getProducts(
            @ModelAttribute ProductFilterRequest filterRequest) {
        Page<ProductResponse> page = customerProductService.getPublicProducts(filterRequest);
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách sản phẩm công khai thành công.", page));
    }

    @GetMapping("/{slug}")
    public ResponseEntity<ApiResponse<ProductDetailResponse>> getProductBySlug(
            @PathVariable("slug") String slug) {
        ProductDetailResponse product = customerProductService.getProductBySlugOrId(slug);
        return ResponseEntity.ok(ApiResponse.success("Lấy chi tiết sản phẩm thành công.", product));
    }
}
