package com.web.ap_sports.service.ai.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.web.ap_sports.dto.request.ai.AiChatSuggestRequest;
import com.web.ap_sports.dto.response.ai.AiChatSuggestResponse;
import com.web.ap_sports.service.ai.GeminiRestClient;
import com.web.ap_sports.service.ai.SupportChatAiService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

/**
 * Triển khai nghiệp vụ cho Agent 5: AI Support Chat Assistant - Smart Reply.
 * Phân tích các tin nhắn gần nhất của phòng chat và chính sách shop để gợi ý 3 phương án phản hồi nhanh cho nhân viên.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class SupportChatAiServiceImpl implements SupportChatAiService {

    private final GeminiRestClient geminiRestClient;
    private final ObjectMapper objectMapper;

    @Override
    public AiChatSuggestResponse suggestReplies(AiChatSuggestRequest request) {
        if (request.getRecentMessages() == null || request.getRecentMessages().isEmpty()) {
            return AiChatSuggestResponse.builder()
                    .suggestions(List.of(
                            "Dạ AP Sports xin chào anh/chị, em có thể hỗ trợ gì cho mình ạ?",
                            "Dạ anh/chị đang quan tâm đến sản phẩm nào bên shop em ạ?",
                            "Dạ anh/chị cho em xin mã đơn hàng để em kiểm tra ngay giúp mình nhé!"
                    ))
                    .build();
        }

        String systemInstruction = """
                Bạn là Trợ lý Hỗ trợ Chăm Sóc Khách Hàng (Support Copilot) của AP Sports.
                Nhiệm vụ của bạn là đọc các tin nhắn gần nhất giữa khách hàng và nhân viên, sau đó gợi ý 3 câu phản hồi mẫu (Smart Replies) ngắn gọn, lịch sự, đúng trọng tâm và đúng chính sách để nhân viên CSKH chọn gửi nhanh.
                TUYỆT ĐỐI KHÔNG DÙNG KÝ TỰ SAO ĐÔI ** trong câu chữ. Hãy viết câu văn tự nhiên, mộc mạc và lịch sự.

                CHÍNH SÁCH BÁN HÀNG CỐT LÕI CỦA AP SPORTS:
                1. Đổi trả: Hỗ trợ đổi size/mẫu trong vòng 7 ngày kể từ khi nhận hàng (yêu cầu còn nguyên tem mác, chưa qua sử dụng).
                2. Phí vận chuyển: Miễn phí giao hàng toàn quốc cho đơn từ 500.000đ. Đơn dưới 500.000đ phí ship đồng giá 30.000đ.
                3. Thời gian giao hàng: Nội thành TP.HCM/Hà Nội 24h, các tỉnh thành khác 2 - 4 ngày làm việc.
                4. Bảo hành: 6 tháng đối với lỗi bung keo, đứt chỉ trên các dòng giày thể thao chính hãng.

                YÊU CẦU ĐỊNH DẠNG OUTPUT:
                Bạn PHẢI trả về duy nhất một chuỗi JSON hợp lệ (không kèm theo bất kỳ chữ nào ngoài JSON) có cấu trúc:
                {
                  "suggestions": [
                    "Câu gợi ý 1...",
                    "Câu gợi ý 2...",
                    "Câu gợi ý 3..."
                  ]
                }
                """;

        StringBuilder chatLog = new StringBuilder();
        if (request.getCustomerName() != null && !request.getCustomerName().isBlank()) {
            chatLog.append("Tên khách hàng: ").append(request.getCustomerName()).append("\n");
        }
        chatLog.append("Các tin nhắn gần nhất:\n");
        for (String msg : request.getRecentMessages()) {
            chatLog.append("- ").append(msg).append("\n");
        }
        chatLog.append("\nHãy gợi ý 3 câu trả lời ngắn gọn, lịch sự, phù hợp ngữ cảnh.");

        String rawReply = geminiRestClient.generateContent(systemInstruction, chatLog.toString(), 0.3, 800);

        return parseSuggestions(rawReply);
    }

    private AiChatSuggestResponse parseSuggestions(String rawReply) {
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
            List<String> list = new ArrayList<>();
            JsonNode suggestionsNode = node.path("suggestions");
            if (suggestionsNode.isArray()) {
                suggestionsNode.forEach(s -> list.add(s.asText("").replace("**", "").trim()));
            }

            if (!list.isEmpty()) {
                return AiChatSuggestResponse.builder().suggestions(list).build();
            }
        } catch (Exception ex) {
            log.warn("Không thể parse JSON từ gợi ý chat của AI: {}", ex.getMessage());
        }

        // Fallback mặc định
        return AiChatSuggestResponse.builder()
                .suggestions(List.of(
                        "Dạ em đã nắm được thông tin, anh/chị đợi em kiểm tra trong giây lát nhé ạ!",
                        "Dạ bên em có hỗ trợ đổi size trong 7 ngày nguyên tem mác anh/chị nha.",
                        "Dạ đơn hàng của mình đã được xác nhận và đang trên đường giao tới anh/chị ạ!"
                ))
                .build();
    }
}
