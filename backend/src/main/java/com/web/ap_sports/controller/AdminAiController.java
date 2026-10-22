package com.web.ap_sports.controller;

import com.web.ap_sports.dto.request.ai.AiChatSuggestRequest;
import com.web.ap_sports.dto.request.ai.AiProductContentRequest;
import com.web.ap_sports.dto.response.ApiResponse;
import com.web.ap_sports.dto.response.ai.*;
import com.web.ap_sports.entity.User;
import com.web.ap_sports.repository.UserRepository;
import com.web.ap_sports.service.ai.ExecutiveBiAiService;
import com.web.ap_sports.service.ai.ProductContentAiService;
import com.web.ap_sports.service.ai.SupportChatAiService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

/**
 * Controller cung cấp các API AI phục vụ Quản trị viên và Nhân viên nội bộ AP Sports.
 * Được bảo vệ chặt chẽ bởi Spring Security RBAC.
 */
@RestController
@RequestMapping("/api/v1/admin/ai")
@RequiredArgsConstructor
public class AdminAiController {

    private final ProductContentAiService productContentAiService;
    private final SupportChatAiService supportChatAiService;
    private final ExecutiveBiAiService executiveBiAiService;
    private final UserRepository userRepository;

    /**
     * Tự động sinh nội dung bài viết mô tả sản phẩm chuẩn SEO & HTML (Dành cho Admin & Staff)
     */
    @PostMapping("/product-description")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<AiProductContentResponse>> generateProductDescription(
            @Valid @RequestBody AiProductContentRequest request
    ) {
        AiProductContentResponse response = productContentAiService.generateProductContent(request);
        return ResponseEntity.ok(ApiResponse.success("Sinh mô tả sản phẩm thành công", response));
    }

    /**
     * Gợi ý 3 câu trả lời nhanh cho nhân viên CSKH trong phòng Live Chat
     */
    @PostMapping("/chat-suggest")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<AiChatSuggestResponse>> suggestReplies(
            @Valid @RequestBody AiChatSuggestRequest request
    ) {
        AiChatSuggestResponse response = supportChatAiService.suggestReplies(request);
        return ResponseEntity.ok(ApiResponse.success("Gợi ý phản hồi thành công", response));
    }

    /**
     * Báo cáo phân tích chiến lược kinh doanh BI cho Ban Giám Đốc (Chỉ dành cho ADMIN)
     */
    @GetMapping("/business-insights")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<AiBusinessAdvisorResponse>> getBusinessInsights(
            Authentication authentication
    ) {
        User currentUser = resolveUser(authentication);
        AiBusinessAdvisorResponse response = executiveBiAiService.getExecutiveInsights(currentUser);
        return ResponseEntity.ok(ApiResponse.success("Lấy báo cáo chiến lược BI thành công", response));
    }

    private User resolveUser(Authentication authentication) {
        if (authentication != null && authentication.isAuthenticated()) {
            String email = authentication.getName();
            return userRepository.findByEmail(email).orElse(null);
        }
        return null;
    }
}
