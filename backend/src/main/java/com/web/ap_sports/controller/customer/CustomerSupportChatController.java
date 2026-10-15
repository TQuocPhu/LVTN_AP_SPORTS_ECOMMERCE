package com.web.ap_sports.controller.customer;

import com.web.ap_sports.dto.request.support.CreateConversationRequest;
import com.web.ap_sports.dto.request.support.RateConversationRequest;
import com.web.ap_sports.dto.request.support.SendSupportMessageRequest;
import com.web.ap_sports.dto.response.ApiResponse;
import com.web.ap_sports.dto.response.support.SupportConversationResponse;
import com.web.ap_sports.dto.response.support.SupportMessageResponse;
import com.web.ap_sports.service.customer.CustomerSupportChatService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/customer/support-chat")
@RequiredArgsConstructor
@PreAuthorize("isAuthenticated() and !hasAuthority('ROLE_ADMIN') and !hasAuthority('ROLE_STAFF')")
public class CustomerSupportChatController {

    private final CustomerSupportChatService customerSupportChatService;

    @GetMapping("/active-conversation")
    public ResponseEntity<ApiResponse<SupportConversationResponse>> getActiveConversation(
            Authentication authentication) {
        SupportConversationResponse response = customerSupportChatService
                .getActiveConversation(authentication.getName());
        return ResponseEntity.ok(ApiResponse.success("Lấy phiên hỗ trợ hiện tại thành công", response));
    }

    @PostMapping("/conversation")
    public ResponseEntity<ApiResponse<SupportConversationResponse>> getOrCreateActiveConversation(
            Authentication authentication,
            @RequestBody(required = false) CreateConversationRequest request) {
        SupportConversationResponse response = customerSupportChatService
                .getOrCreateActiveConversation(authentication.getName(), request);
        return ResponseEntity.ok(ApiResponse.success("Lấy phiên hỗ trợ trực tuyến thành công", response));
    }

    @GetMapping("/conversations")
    public ResponseEntity<ApiResponse<Page<SupportConversationResponse>>> getMyConversations(
            Authentication authentication,
            @PageableDefault(size = 10, sort = "lastMessageAt", direction = Sort.Direction.DESC) Pageable pageable) {
        Page<SupportConversationResponse> response = customerSupportChatService
                .getMyConversations(authentication.getName(), pageable);
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách các ca hỗ trợ thành công", response));
    }

    @GetMapping("/conversations/{id}/messages")
    public ResponseEntity<ApiResponse<List<SupportMessageResponse>>> getMessages(
            Authentication authentication,
            @PathVariable Long id) {
        List<SupportMessageResponse> response = customerSupportChatService
                .getMessages(authentication.getName(), id);
        return ResponseEntity.ok(ApiResponse.success("Lấy tin nhắn cuộc trò chuyện thành công", response));
    }

    @PostMapping("/conversations/{id}/messages")
    public ResponseEntity<ApiResponse<SupportMessageResponse>> sendMessage(
            Authentication authentication,
            @PathVariable Long id,
            @Valid @RequestBody SendSupportMessageRequest request) {
        SupportMessageResponse response = customerSupportChatService
                .sendMessage(authentication.getName(), id, request);
        return ResponseEntity.ok(ApiResponse.success("Gửi tin nhắn thành công", response));
    }

    @PostMapping("/conversations/{id}/read")
    public ResponseEntity<ApiResponse<Void>> markAsRead(
            Authentication authentication,
            @PathVariable Long id) {
        customerSupportChatService.markAsRead(authentication.getName(), id);
        return ResponseEntity.ok(ApiResponse.success("Đã đánh dấu đọc tin nhắn", null));
    }

    @PostMapping("/conversations/{id}/rate")
    public ResponseEntity<ApiResponse<SupportConversationResponse>> rateConversation(
            Authentication authentication,
            @PathVariable Long id,
            @Valid @RequestBody RateConversationRequest request) {
        SupportConversationResponse response = customerSupportChatService
                .rateConversation(authentication.getName(), id, request);
        return ResponseEntity.ok(ApiResponse.success("Cảm ơn bạn đã đánh giá chất lượng dịch vụ hỗ trợ", response));
    }
}
