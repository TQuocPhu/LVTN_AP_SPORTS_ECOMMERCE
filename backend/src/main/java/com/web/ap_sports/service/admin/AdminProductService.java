package com.web.ap_sports.service.admin;

import com.web.ap_sports.dto.request.admin.CreateProductRequest;
import com.web.ap_sports.dto.request.admin.UpdateProductRequest;
import com.web.ap_sports.dto.request.common.ProductFilterRequest;
import com.web.ap_sports.dto.response.common.ProductDetailResponse;
import com.web.ap_sports.dto.response.common.ProductResponse;
import com.web.ap_sports.dto.response.common.VariantResponse;
import org.springframework.data.domain.Page;

public interface AdminProductService {

    Page<ProductResponse> getProducts(ProductFilterRequest filterRequest);

    ProductDetailResponse getProductById(Long id);

    ProductDetailResponse createProduct(CreateProductRequest request, String currentUserEmail);

    ProductDetailResponse updateProduct(Long id, UpdateProductRequest request);

    ProductResponse toggleProductStatus(Long id);

    VariantResponse toggleVariantStatus(Long productId, Long variantId);

    void deleteProduct(Long id);
}
