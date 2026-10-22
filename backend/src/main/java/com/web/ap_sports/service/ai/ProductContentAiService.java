package com.web.ap_sports.service.ai;

import com.web.ap_sports.dto.request.ai.AiProductContentRequest;
import com.web.ap_sports.dto.response.ai.AiProductContentResponse;

/**
 * Interface cho Agent 2: AI Product Content Creator (Sinh mô tả sản phẩm chuẩn SEO & HTML).
 */
public interface ProductContentAiService {

    /**
     * Tự động sinh nội dung bài viết HTML và thẻ SEO cho sản phẩm dựa trên thông tin thuộc tính
     */
    AiProductContentResponse generateProductContent(AiProductContentRequest request);
}
