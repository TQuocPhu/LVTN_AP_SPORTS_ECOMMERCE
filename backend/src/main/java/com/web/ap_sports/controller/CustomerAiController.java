package com.web.ap_sports.controller;

import com.web.ap_sports.dto.request.ai.AiSportsAdvisorRequest;
import com.web.ap_sports.dto.response.ai.AiReviewSummaryResponse;
import com.web.ap_sports.dto.response.ai.AiSportsAdvisorResponse;
import com.web.ap_sports.dto.response.ai.ChatMessageResponse;
import com.web.ap_sports.dto.response.ApiResponse;
import com.web.ap_sports.entity.ChatMessage;
import com.web.ap_sports.entity.User;
import com.web.ap_sports.repository.UserRepository;
import com.web.ap_sports.service.ai.ReviewSentimentAiService;
import com.web.ap_sports.service.ai.SportsAdvisorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller cung cấp các API AI phục vụ Khách hàng (Web & Mobile).
 * Bao gồm: Tư vấn trang bị thể thao & chọn size, xem lịch sử tư vấn, xem tóm tắt đánh giá sản phẩm.
 */
@RestController
@RequestMapping("/api/v1/customer/ai")
@RequiredArgsConstructor
public class CustomerAiController {

    private final SportsAdvisorService sportsAdvisorService;
    private final ReviewSentimentAiService reviewSentimentAiService;
    private final UserRepository userRepository;

    /**
     * Tư vấn thể thao và kích thước trang bị theo thông số khách hàng
     */
    @PostMapping("/advisor")
    public ResponseEntity<ApiResponse<AiSportsAdvisorResponse>> askAdvisor(
            @Valid @RequestBody AiSportsAdvisorRequest request,
            Authentication authentication
    ) {
        User currentUser = resolveUser(authentication);
        AiSportsAdvisorResponse response = sportsAdvisorService.advise(request, currentUser);
        return ResponseEntity.ok(ApiResponse.success("Tư vấn thành công", response));
    }

    /**
     * Lấy toàn bộ lịch sử hội thoại tư vấn kèm danh sách sản phẩm gợi ý
     */
    @GetMapping("/advisor/history")
    public ResponseEntity<ApiResponse<List<ChatMessageResponse>>> getChatHistory(
            @RequestParam(required = false) String guestToken,
            Authentication authentication
    ) {
        User currentUser = resolveUser(authentication);
        List<ChatMessageResponse> history = sportsAdvisorService.getChatHistory(currentUser, guestToken);
        return ResponseEntity.ok(ApiResponse.success("Lấy lịch sử hội thoại thành công", history));
    }

    /**
     * Lấy tóm tắt phân tích cảm xúc từ các đánh giá thực tế của một sản phẩm
     */
    @GetMapping("/reviews/{productId}/summary")
    public ResponseEntity<ApiResponse<AiReviewSummaryResponse>> getReviewSummary(
            @PathVariable Long productId
    ) {
        AiReviewSummaryResponse response = reviewSentimentAiService.getReviewSummary(productId);
        return ResponseEntity.ok(ApiResponse.success("Lấy tóm tắt đánh giá thành công", response));
    }

    private User resolveUser(Authentication authentication) {
        if (authentication != null && authentication.isAuthenticated() && !"anonymousUser".equals(authentication.getPrincipal())) {
            String email = authentication.getName();
            return userRepository.findByEmail(email).orElse(null);
        }
        return null;
    }
}
