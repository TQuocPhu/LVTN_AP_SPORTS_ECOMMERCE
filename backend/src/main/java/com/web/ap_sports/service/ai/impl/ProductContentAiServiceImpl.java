package com.web.ap_sports.service.ai.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.web.ap_sports.dto.request.ai.AiProductContentRequest;
import com.web.ap_sports.dto.response.ai.AiProductContentResponse;
import com.web.ap_sports.service.ai.GeminiRestClient;
import com.web.ap_sports.service.ai.ProductContentAiService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Map;

/**
 * Triển khai nghiệp vụ cho Agent 2: AI Product Content Creator.
 * Hỗ trợ nhân viên nội dung và quản trị viên tự động tạo bài viết mô tả sản phẩm chuẩn SEO và HTML sạch.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ProductContentAiServiceImpl implements ProductContentAiService {

    private final GeminiRestClient geminiRestClient;
    private final ObjectMapper objectMapper;

    @Override
    public AiProductContentResponse generateProductContent(AiProductContentRequest request) {
        String systemInstruction = """
                Bạn là Giám đốc Sáng tạo Nội dung E-commerce Thể thao (Head of Sports Content & SEO) của AP Sports.
                Nhiệm vụ của bạn là nhận thông tin sản phẩm và tạo ra bài viết mô tả sản phẩm hấp dẫn, chuẩn SEO Google, ĐỊNH DẠNG HTML SẠCH (Clean HTML) để điền trực tiếp vào Rich Text Editor.

                ⛔ QUY TẮC ĐỊNH DẠNG HTML BẮT BUỘC:
                1. TUYỆT ĐỐI KHÔNG DÙNG CÚ PHÁP MARKDOWN NHƯ DẤU SAO ĐÔI **text** HOẶC DẤU THĂNG #.
                2. Để in đậm từ ngữ quan trọng, BẮT BUỘC dùng thẻ HTML: <strong>từ cần nhấn mạnh</strong>.
                3. Dùng các thẻ HTML chuẩn: <p>, <h3>, <ul>, <li>, <strong>, <em>.
                4. Cấu trúc bài viết gồm:
                   - Đoạn mở đầu (<p>): Giới thiệu truyền cảm hứng, phong cách thi đấu thể thao hiện đại.
                   - Đặc điểm nổi bật (<h3>Đặc Điểm & Công Nghệ Nổi Bật</h3><ul><li>...</li></ul>).
                   - Hướng dẫn chọn size (<h3>Hướng Dẫn Chọn Size Chuẩn Xác</h3><p>...</p>).
                   - Hướng dẫn bảo quản (<h3>Hướng Dẫn Bảo Quản & Sử Dụng</h3><ul><li>...</li></ul>).

                YÊU CẦU ĐỊNH DẠNG OUTPUT:
                Bạn PHẢI trả về duy nhất một chuỗi JSON hợp lệ (không kèm theo bất kỳ chữ nào ngoài JSON) có cấu trúc:
                {
                  "htmlContent": "<p>Nội dung HTML hoàn chỉnh ở đây...</p>",
                  "seoTitle": "Tiêu đề SEO chuẩn < 60 ký tự",
                  "metaDescription": "Thẻ mô tả tóm tắt chuẩn SEO < 160 ký tự"
                }
                """;

        StringBuilder userPrompt = new StringBuilder();
        userPrompt.append("Tên sản phẩm: ").append(request.getProductName()).append("\n");
        if (request.getCategoryName() != null && !request.getCategoryName().isBlank()) {
            userPrompt.append("Danh mục: ").append(request.getCategoryName()).append("\n");
        }
        if (request.getBrand() != null && !request.getBrand().isBlank()) {
            userPrompt.append("Thương hiệu: ").append(request.getBrand()).append("\n");
        }
        if (request.getAttributes() != null && !request.getAttributes().isEmpty()) {
            userPrompt.append("Các thuộc tính kỹ thuật:\n");
            for (Map.Entry<String, String> entry : request.getAttributes().entrySet()) {
                userPrompt.append("- ").append(entry.getKey()).append(": ").append(entry.getValue()).append("\n");
            }
        }
        if (request.getTone() != null && !request.getTone().isBlank()) {
            userPrompt.append("Phong cách mong muốn: ").append(request.getTone()).append("\n");
        }

        userPrompt.append("\nHãy tạo bài viết mô tả sản phẩm và trả về đúng JSON theo yêu cầu.");

        String rawReply = geminiRestClient.generateContent(systemInstruction, userPrompt.toString(), 0.5, 2048);

        // Parse JSON phản hồi
        return parseResponseJson(rawReply, request.getProductName());
    }

    private AiProductContentResponse parseResponseJson(String rawReply, String productName) {
        try {
            // Làm sạch nếu AI vô tình bọc trong ```json ... ```
            String cleanedJson = rawReply.trim();
            if (cleanedJson.startsWith("```json")) {
                cleanedJson = cleanedJson.substring(7);
            }
            if (cleanedJson.startsWith("```")) {
                cleanedJson = cleanedJson.substring(3);
            }
            if (cleanedJson.endsWith("```")) {
                cleanedJson = cleanedJson.substring(0, cleanedJson.length() - 3);
            }
            cleanedJson = cleanedJson.trim();

            JsonNode node = objectMapper.readTree(cleanedJson);
            String htmlContent = node.path("htmlContent").asText("");

            // Chuẩn hóa định dạng cho Rich Text Editor:
            // Chuyển đổi toàn bộ cú pháp markdown bold **text** thành thẻ HTML <strong>text</strong> chuẩn
            if (htmlContent != null) {
                htmlContent = htmlContent.replaceAll("\\*\\*(.*?)\\*\\*", "<strong>$1</strong>");
                htmlContent = htmlContent.replace("**", "").trim();
            }

            String seoTitle = node.path("seoTitle").asText(productName + " - Chính Hãng Tại AP Sports").replace("**", "");
            String metaDescription = node.path("metaDescription").asText("Mua " + productName + " chính hãng giá tốt tại AP Sports. Giao hàng toàn quốc, đổi size 7 ngày.").replace("**", "");

            return AiProductContentResponse.builder()
                    .htmlContent(htmlContent)
                    .seoTitle(seoTitle)
                    .metaDescription(metaDescription)
                    .build();
        } catch (Exception ex) {
            log.warn("Không thể parse JSON từ phản hồi mô tả sản phẩm của AI: {}", ex.getMessage());
            String safeHtml = rawReply.replaceAll("\\*\\*(.*?)\\*\\*", "<strong>$1</strong>").replace("**", "");
            return AiProductContentResponse.builder()
                    .htmlContent(safeHtml)
                    .seoTitle(productName + " - Chính Hãng Tại AP Sports")
                    .metaDescription("Mua " + productName + " chính hãng giá tốt tại AP Sports.")
                    .build();
        }
    }
}
