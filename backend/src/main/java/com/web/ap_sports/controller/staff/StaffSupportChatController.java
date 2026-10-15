package com.web.ap_sports.controller.staff;

import com.web.ap_sports.dto.request.support.CreateSupportReportRequest;
import com.web.ap_sports.dto.request.support.SendSupportMessageRequest;
import com.web.ap_sports.dto.response.ApiResponse;
import com.web.ap_sports.dto.response.support.SupportConversationResponse;
import com.web.ap_sports.dto.response.support.SupportMessageResponse;
import com.web.ap_sports.dto.response.support.SupportReportResponse;
import com.web.ap_sports.service.staff.StaffSupportChatService;
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
@RequestMapping("/api/v1/staff/support-chat")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('SUPPORT_LIVE_CHAT') or hasRole('ADMIN')")
public class StaffSupportChatController {

    private final StaffSupportChatService staffSupportChatService;

    @GetMapping("/queue")
    public ResponseEntity<ApiResponse<List<SupportConversationResponse>>> getWaitingQueue() {
        List<SupportConversationResponse> response = staffSupportChatService.getWaitingQueue();
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách hàng đợi hỗ trợ thành công", response));
    }

    @GetMapping("/my-conversations")
    public ResponseEntity<ApiResponse<List<SupportConversationResponse>>> getMyActiveConversations(
            Authentication authentication) {
        List<SupportConversationResponse> response = staffSupportChatService
                .getMyActiveConversations(authentication.getName());
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách cuộc trò chuyện đang tiếp nhận thành công", response));
    }

    @GetMapping("/history")
    public ResponseEntity<ApiResponse<Page<SupportConversationResponse>>> getConversationHistory(
            Authentication authentication,
            @PageableDefault(size = 20, sort = "lastMessageAt", direction = Sort.Direction.DESC) Pageable pageable) {
        Page<SupportConversationResponse> response = staffSupportChatService
                .getConversationHistory(authentication.getName(), pageable);
        return ResponseEntity.ok(ApiResponse.success("Lấy lịch sử các ca hỗ trợ thành công", response));
    }

    @PostMapping("/conversations/{id}/accept")
    public ResponseEntity<ApiResponse<SupportConversationResponse>> acceptConversation(
            Authentication authentication,
            @PathVariable Long id) {
        SupportConversationResponse response = staffSupportChatService
                .acceptConversation(authentication.getName(), id);
        return ResponseEntity.ok(ApiResponse.success("Tiếp nhận cuộc trò chuyện thành công", response));
    }

    @GetMapping("/conversations/{id}/messages")
    public ResponseEntity<ApiResponse<List<SupportMessageResponse>>> getMessages(
            Authentication authentication,
            @PathVariable Long id) {
        List<SupportMessageResponse> response = staffSupportChatService
                .getMessages(authentication.getName(), id);
        return ResponseEntity.ok(ApiResponse.success("Lấy lịch sử tin nhắn thành công", response));
    }

    @PostMapping("/conversations/{id}/messages")
    public ResponseEntity<ApiResponse<SupportMessageResponse>> sendMessage(
            Authentication authentication,
            @PathVariable Long id,
            @Valid @RequestBody SendSupportMessageRequest request) {
        SupportMessageResponse response = staffSupportChatService
                .sendMessage(authentication.getName(), id, request);
        return ResponseEntity.ok(ApiResponse.success("Gửi tin nhắn phản hồi thành công", response));
    }

    @PostMapping("/conversations/{id}/resolve")
    public ResponseEntity<ApiResponse<SupportConversationResponse>> resolveConversation(
            Authentication authentication,
            @PathVariable Long id) {
        SupportConversationResponse response = staffSupportChatService
                .resolveConversation(authentication.getName(), id);
        return ResponseEntity.ok(ApiResponse.success("Đã hoàn tất hỗ trợ cuộc trò chuyện", response));
    }

    @PostMapping("/conversations/{id}/report")
    public ResponseEntity<ApiResponse<SupportReportResponse>> reportCustomer(
            Authentication authentication,
            @PathVariable Long id,
            @Valid @RequestBody CreateSupportReportRequest request) {
        SupportReportResponse response = staffSupportChatService
                .reportCustomer(authentication.getName(), id, request);
        return ResponseEntity.ok(ApiResponse.success("Đã gửi báo cáo vi phạm tới Ban quản trị thành công", response));
    }

    @PostMapping("/conversations/{id}/read")
    public ResponseEntity<ApiResponse<Void>> markAsRead(
            Authentication authentication,
            @PathVariable Long id) {
        staffSupportChatService.markAsRead(authentication.getName(), id);
        return ResponseEntity.ok(ApiResponse.success("Đã đánh dấu đọc tin nhắn", null));
    }
}
