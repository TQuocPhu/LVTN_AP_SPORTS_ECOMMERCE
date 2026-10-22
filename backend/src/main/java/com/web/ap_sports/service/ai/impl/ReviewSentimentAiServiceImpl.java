package com.web.ap_sports.service.ai.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.web.ap_sports.dto.response.ai.AiReviewSummaryResponse;
import com.web.ap_sports.entity.Review;
import com.web.ap_sports.repository.ReviewRepository;
import com.web.ap_sports.service.ai.GeminiRestClient;
import com.web.ap_sports.service.ai.ReviewSentimentAiService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Triển khai nghiệp vụ cho Agent 4: AI Review Sentiment & Summary.
 * Tự động đọc các đánh giá đã duyệt của sản phẩm, tổng hợp ưu/nhược điểm và tính toán tỷ lệ hài lòng.
 * Tích hợp Cache 6 tiếng theo productId.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ReviewSentimentAiServiceImpl implements ReviewSentimentAiService {

    private final ReviewRepository reviewRepository;
    private final GeminiRestClient geminiRestClient;
    private final ObjectMapper objectMapper;

    // Cache tóm tắt đánh giá trong 6 tiếng theo productId
    private static final Map<Long, CacheEntry> REVIEW_CACHE = new ConcurrentHashMap<>();
    private static final long CACHE_TTL_MS = 6 * 60 * 60 * 1000L;

    private record CacheEntry(AiReviewSummaryResponse data, long timestamp) {}

    @Override
    public AiReviewSummaryResponse getReviewSummary(Long productId) {
        if (productId == null) {
            return buildEmptyResponse(0L, "Mã sản phẩm không hợp lệ.");
        }

        // 1. Kiểm tra cache
        CacheEntry cached = REVIEW_CACHE.get(productId);
        if (cached != null && (System.currentTimeMillis() - cached.timestamp()) < CACHE_TTL_MS) {
            log.info("Trả về tóm tắt đánh giá sản phẩm {} từ Cache", productId);
            return cached.data();
        }

        // 2. Lấy tối đa 25 đánh giá mới nhất đã được duyệt
        Page<Review> reviewsPage = reviewRepository.findByProductIdAndStatusOrderByCreatedAtDesc(
                productId, "approved", PageRequest.of(0, 25)
        );

        List<Review> reviews = reviewsPage.getContent();
        if (reviews.isEmpty()) {
            return buildEmptyResponse(productId, "Sản phẩm hiện chưa có đủ đánh giá từ khách hàng để AI phân tích.");
        }

        // 3. Xây dựng prompt chứa các nhận xét thực tế
        StringBuilder reviewsText = new StringBuilder();
        int positiveCount = 0;
        for (Review r : reviews) {
            reviewsText.append("- [").append(r.getRating()).append(" sao] ")
                    .append(r.getComment() != null ? r.getComment() : "")
                    .append("\n");
            if (r.getRating() >= 4) {
                positiveCount++;
            }
        }

        int roughRate = (int) Math.round((double) positiveCount / reviews.size() * 100);

        String systemInstruction = """
                Bạn là Chuyên viên Phân tích Cảm xúc & Trải nghiệm Khách hàng (Customer Sentiment Analyst) của AP Sports.
                Nhiệm vụ của bạn là đọc các nhận xét thực tế của khách hàng về sản phẩm và đúc kết ngắn gọn, khách quan.
                Tuyệt đối không bịa đặt thêm các tính năng không có trong nhận xét.
                TUYỆT ĐỐI KHÔNG DÙNG KÝ TỰ SAO ĐÔI ** trong văn bản. Hãy viết chữ thuần túy, mộc mạc và dễ đọc.

                YÊU CẦU ĐỊNH DẠNG OUTPUT:
                Bạn PHẢI trả về duy nhất một chuỗi JSON hợp lệ (không kèm theo bất kỳ chữ nào ngoài JSON) có cấu trúc:
                {
                  "satisfactionRate": 90,
                  "positiveHighlights": [
                    "Điểm cộng 1 (ngắn gọn)...",
                    "Điểm cộng 2..."
                  ],
                  "negativeNotes": [
                    "Điểm lưu ý/nhược điểm 1...",
                    "Điểm lưu ý 2..."
                  ],
                  "summaryText": "Đoạn tóm tắt tổng quan 2-3 câu..."
                }
                """;

        String userPrompt = "Danh sách đánh giá thực tế của khách hàng:\n" + reviewsText +
                "\nHãy phân tích và trả về đúng JSON theo yêu cầu.";

        String rawReply = geminiRestClient.generateContent(systemInstruction, userPrompt, 0.3, 1000);

        AiReviewSummaryResponse response = parseReviewResponse(rawReply, productId, reviews.size(), roughRate);

        // Lưu vào cache
        REVIEW_CACHE.put(productId, new CacheEntry(response, System.currentTimeMillis()));

        return response;
    }

    private AiReviewSummaryResponse buildEmptyResponse(Long productId, String msg) {
        return AiReviewSummaryResponse.builder()
                .productId(productId)
                .satisfactionRate(100)
                .totalReviewsAnalyzed(0)
                .positiveHighlights(Collections.emptyList())
                .negativeNotes(Collections.emptyList())
                .summaryText(msg)
                .build();
    }

    private AiReviewSummaryResponse parseReviewResponse(String rawReply, Long productId, int totalReviews, int fallbackRate) {
        try {
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

            List<String> posList = new ArrayList<>();
            JsonNode posNode = node.path("positiveHighlights");
            if (posNode.isArray()) {
                posNode.forEach(p -> posList.add(p.asText("").replace("**", "").trim()));
            }

            List<String> negList = new ArrayList<>();
            JsonNode negNode = node.path("negativeNotes");
            if (negNode.isArray()) {
                negNode.forEach(n -> negList.add(n.asText("").replace("**", "").trim()));
            }

            String summary = node.path("summaryText").asText("Đa số khách hàng đều hài lòng với chất lượng và độ bền của sản phẩm.").replace("**", "").trim();

            return AiReviewSummaryResponse.builder()
                    .productId(productId)
                    .satisfactionRate(node.path("satisfactionRate").asInt(fallbackRate))
                    .totalReviewsAnalyzed(totalReviews)
                    .positiveHighlights(posList.isEmpty() ? List.of("Chất lượng sản phẩm tốt, đúng mô tả.") : posList)
                    .negativeNotes(negList.isEmpty() ? List.of("Nên tham khảo kỹ bảng size trước khi chọn.") : negList)
                    .summaryText(summary)
                    .build();
        } catch (Exception ex) {
            log.warn("Không thể parse JSON từ phản hồi review của AI: {}", ex.getMessage());
            return AiReviewSummaryResponse.builder()
                    .productId(productId)
                    .satisfactionRate(fallbackRate)
                    .totalReviewsAnalyzed(totalReviews)
                    .positiveHighlights(List.of("Sản phẩm chính hãng, độ hoàn thiện tốt."))
                    .negativeNotes(List.of("Cần lưu ý chọn đúng cỡ chân."))
                    .summaryText("Sản phẩm nhận được phản hồi tích cực từ cộng đồng người mua.")
                    .build();
        }
    }
}
