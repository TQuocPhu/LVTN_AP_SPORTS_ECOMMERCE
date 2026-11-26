package com.web.ap_sports.service.customer;

import com.web.ap_sports.dto.request.common.ProductFilterRequest;
import com.web.ap_sports.dto.response.common.AvailableVariantSizeResponse;
import com.web.ap_sports.dto.response.common.ProductDetailResponse;
import com.web.ap_sports.dto.response.common.ProductResponse;
import org.springframework.data.domain.Page;

import java.util.List;

public interface CustomerProductService {

    Page<ProductResponse> getPublicProducts(ProductFilterRequest filterRequest);

    /**
     * Trích xuất danh sách kích thước / quy cách biến thể thực tế từ các sản phẩm đang hiển thị
     * (theo danh mục cha/con/cháu và từ khóa tìm kiếm, đọc trực tiếp từ DB không qua Redis).
     */
    AvailableVariantSizeResponse getAvailableVariantSizes(Long categoryId, String keyword);

    ProductDetailResponse getProductBySlugOrId(String slugOrId);

    Page<ProductResponse> searchProductsByRelevance(String keyword, int page, int size);

    List<ProductResponse> getTopRatedProducts(int limit);

    List<ProductResponse> getFeaturedProducts(int limit);
}
