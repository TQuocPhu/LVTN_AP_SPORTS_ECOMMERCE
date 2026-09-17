package com.web.ap_sports.service.customer;

import com.web.ap_sports.dto.request.common.ProductFilterRequest;
import com.web.ap_sports.dto.response.common.ProductDetailResponse;
import com.web.ap_sports.dto.response.common.ProductResponse;
import org.springframework.data.domain.Page;

public interface CustomerProductService {

    Page<ProductResponse> getPublicProducts(ProductFilterRequest filterRequest);

    ProductDetailResponse getProductBySlugOrId(String slugOrId);
}
