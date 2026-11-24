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

import java.util.List;

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

    /**
     * Lấy danh sách sản phẩm được đánh giá cao nhất (mặc định 2 sản phẩm)
     */
    @GetMapping("/top-rated")
    public ResponseEntity<ApiResponse<List<ProductResponse>>> getTopRatedProducts(
            @RequestParam(value = "limit", defaultValue = "2") int limit) {
        List<ProductResponse> products = customerProductService.getTopRatedProducts(limit);
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách sản phẩm đánh giá cao thành công.", products));
    }

    /**
     * Lấy danh sách trang thiết bị nổi bật (nhiều đơn hàng + đánh giá tốt, bù mới nhất nếu chưa đủ)
     */
    @GetMapping("/featured")
    public ResponseEntity<ApiResponse<List<ProductResponse>>> getFeaturedProducts(
            @RequestParam(value = "limit", defaultValue = "8") int limit) {
        List<ProductResponse> products = customerProductService.getFeaturedProducts(limit);
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách trang thiết bị nổi bật thành công.", products));
    }

    @GetMapping("/{slug}")
    public ResponseEntity<ApiResponse<ProductDetailResponse>> getProductBySlug(
            @PathVariable("slug") String slug) {
        ProductDetailResponse product = customerProductService.getProductBySlugOrId(slug);
        return ResponseEntity.ok(ApiResponse.success("Lấy chi tiết sản phẩm thành công.", product));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<Page<ProductResponse>>> searchProducts(
            @RequestParam(value = "keyword", required = false, defaultValue = "") String keyword,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size) {
        Page<ProductResponse> result = customerProductService.searchProductsByRelevance(keyword, page, size);
        return ResponseEntity.ok(ApiResponse.success("Tìm kiếm sản phẩm thành công.", result));
    }
}
