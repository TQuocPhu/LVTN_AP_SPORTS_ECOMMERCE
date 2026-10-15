package com.web.ap_sports.service.staff.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.web.ap_sports.dto.request.support.CreateSupportReportRequest;
import com.web.ap_sports.dto.request.support.SendSupportMessageRequest;
import com.web.ap_sports.dto.response.support.SupportConversationResponse;
import com.web.ap_sports.dto.response.support.SupportMessageResponse;
import com.web.ap_sports.dto.response.support.SupportReportResponse;
import com.web.ap_sports.entity.SupportConversation;
import com.web.ap_sports.entity.SupportMessage;
import com.web.ap_sports.entity.SupportReport;
import com.web.ap_sports.entity.User;
import com.web.ap_sports.enums.NotificationActionType;
import com.web.ap_sports.exception.ResourceNotFoundException;
import com.web.ap_sports.repository.SupportConversationRepository;
import com.web.ap_sports.repository.SupportMessageRepository;
import com.web.ap_sports.repository.SupportReportRepository;
import com.web.ap_sports.repository.UserRepository;
import com.web.ap_sports.service.common.NotificationService;
import com.web.ap_sports.service.staff.StaffSupportChatService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class StaffSupportChatServiceImpl implements StaffSupportChatService {

    private final SupportConversationRepository conversationRepository;
    private final SupportMessageRepository messageRepository;
    private final SupportReportRepository reportRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final NotificationService notificationService;
    private final ObjectMapper objectMapper;

    @Override
    @Transactional(readOnly = true)
    public List<SupportConversationResponse> getWaitingQueue() {
        return conversationRepository.findByStatusOrderByCreatedAtAsc("WAITING").stream()
                .map(this::mapToStaffConversationResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<SupportConversationResponse> getMyActiveConversations(String staffEmail) {
        User staff = getUserByEmail(staffEmail);
        return conversationRepository.findByStaffIdAndStatusInOrderByLastMessageAtDesc(
                staff.getId(), List.of("IN_PROGRESS", "RESOLVED")).stream()
                .map(this::mapToStaffConversationResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public SupportConversationResponse acceptConversation(String staffEmail, Long conversationId) {
        User staff = getUserByEmail(staffEmail);

        // Atomic Conditional Update: Chỉ update nếu status đang là WAITING
        int updated = conversationRepository.assignStaffAtomically(conversationId, staff);
        if (updated == 0) {
            throw new IllegalArgumentException("Ca hỗ trợ này vừa được nhân viên khác tiếp nhận hoặc không còn ở trạng thái chờ.");
        }

        SupportConversation conversation = getConversationById(conversationId);
        LocalDateTime now = LocalDateTime.now();

        // Tạo tin nhắn hệ thống thông báo nhân viên đã tiếp nhận
        SupportMessage systemMsg = SupportMessage.builder()
                .conversation(conversation)
                .sender(null)
                .senderRole("SYSTEM")
                .content("Chuyên viên tư vấn " + staff.getName() + " đã tiếp nhận cuộc trò chuyện.")
                .createdAt(now)
                .build();
        messageRepository.save(systemMsg);

        // Cập nhật staff_last_read_at
        conversation.setStaffLastReadAt(now);
        conversationRepository.save(conversation);

        SupportMessageResponse msgResponse = mapToMessageResponse(systemMsg);
        pushRealtimeMessage(conversation, msgResponse);

        // Cập nhật lại hàng đợi cho các staff khác
        notifyStaffQueueUpdated();

        return mapToStaffConversationResponse(conversation);
    }

    @Override
    @Transactional
    public List<SupportMessageResponse> getMessages(String staffEmail, Long conversationId) {
        getUserByEmail(staffEmail);
        getConversationById(conversationId);

        // Cập nhật staff_last_read_at
        conversationRepository.markStaffRead(conversationId);

        return messageRepository.findByConversationIdOrderByCreatedAtAsc(conversationId).stream()
                .map(this::mapToMessageResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public SupportMessageResponse sendMessage(String staffEmail, Long conversationId, SendSupportMessageRequest request) {
        User staff = getUserByEmail(staffEmail);
        SupportConversation conversation = getConversationById(conversationId);
        validateStaffCanOperate(conversation, staff);

        if (!"IN_PROGRESS".equalsIgnoreCase(conversation.getStatus())) {
            if ("WAITING".equalsIgnoreCase(conversation.getStatus())) {
                throw new IllegalArgumentException("Vui lòng tiếp nhận ca hỗ trợ trước khi phản hồi tin nhắn.");
            }
            throw new IllegalArgumentException("Ca hỗ trợ này đã kết thúc, không thể gửi tin nhắn tiếp.");
        }

        String content = request.getContent() != null ? request.getContent().trim() : null;
        String attachmentUrl = request.getAttachmentUrl() != null ? request.getAttachmentUrl().trim() : null;

        if ((content == null || content.isEmpty()) && (attachmentUrl == null || attachmentUrl.isEmpty())) {
            throw new IllegalArgumentException("Nội dung tin nhắn hoặc ảnh đính kèm không được để trống.");
        }

        LocalDateTime now = LocalDateTime.now();
        SupportMessage message = SupportMessage.builder()
                .conversation(conversation)
                .sender(staff)
                .senderRole("STAFF")
                .content(content)
                .attachmentUrl(attachmentUrl)
                .createdAt(now)
                .build();

        SupportMessage saved = messageRepository.save(message);

        // Cập nhật last_message_at và staff_last_read_at
        conversation.setLastMessageAt(now);
        conversation.setStaffLastReadAt(now);
        conversationRepository.save(conversation);

        SupportMessageResponse response = mapToMessageResponse(saved);
        pushRealtimeMessage(conversation, response);

        return response;
    }

    @Override
    @Transactional
    public SupportConversationResponse resolveConversation(String staffEmail, Long conversationId) {
        User staff = getUserByEmail(staffEmail);
        SupportConversation conversation = getConversationById(conversationId);
        validateStaffCanOperate(conversation, staff);

        if (!"IN_PROGRESS".equalsIgnoreCase(conversation.getStatus())) {
            throw new IllegalArgumentException("Chỉ có thể hoàn tất ca hỗ trợ đang trong trạng thái xử lý.");
        }

        conversation.setStatus("RESOLVED");
        LocalDateTime now = LocalDateTime.now();

        // Tin nhắn hệ thống thông báo hoàn tất ca
        SupportMessage systemMsg = SupportMessage.builder()
                .conversation(conversation)
                .sender(null)
                .senderRole("SYSTEM")
                .content("Ca tư vấn đã được đánh dấu hoàn tất. Cảm ơn quý khách đã tin dùng AP Sports!")
                .createdAt(now)
                .build();
        messageRepository.save(systemMsg);

        SupportConversation saved = conversationRepository.save(conversation);
        pushRealtimeMessage(saved, mapToMessageResponse(systemMsg));
        notifyStaffQueueUpdated();

        return mapToStaffConversationResponse(saved);
    }

    @Override
    @Transactional
    public SupportReportResponse reportCustomer(String staffEmail, Long conversationId, CreateSupportReportRequest request) {
        User staff = getUserByEmail(staffEmail);
        SupportConversation conversation = getConversationById(conversationId);
        User customer = conversation.getCustomer();

        String evidenceJson = null;
        if (request.getEvidenceImageUrls() != null && !request.getEvidenceImageUrls().isEmpty()) {
            try {
                evidenceJson = objectMapper.writeValueAsString(request.getEvidenceImageUrls());
            } catch (Exception e) {
                log.warn("Không thể serialize danh sách ảnh bằng chứng", e);
            }
        }

        SupportReport report = SupportReport.builder()
                .conversation(conversation)
                .reportedCustomer(customer)
                .reportedByStaff(staff)
                .reason(request.getReason().trim())
                .evidenceImageUrls(evidenceJson)
                .status("PENDING")
                .build();

        SupportReport saved = reportRepository.save(report);

        // Gửi thông báo WebSocket tới chuông thông báo của toàn bộ ADMIN
        try {
            Map<String, Object> payloadMap = new HashMap<>();
            payloadMap.put("title", "Cảnh báo vi phạm từ nhân viên " + staff.getName());
            payloadMap.put("content", "Khách hàng " + customer.getName() + " (" + customer.getEmail() + ") bị báo cáo: " + request.getReason());
            payloadMap.put("reportId", saved.getId());
            payloadMap.put("conversationId", conversationId);
            payloadMap.put("customerId", customer.getId());

            String payloadStr = objectMapper.writeValueAsString(payloadMap);
            String targetUrl = "/admin/users?highlight=" + customer.getId();

            notificationService.sendToInternalUsers(
                    List.of("ADMIN"),
                    staff.getId(),
                    NotificationActionType.SYSTEM_ALERT,
                    targetUrl,
                    payloadStr
            );
            log.info("Đã gửi thông báo cảnh báo vi phạm tới Admin cho report #{}", saved.getId());
        } catch (Exception e) {
            log.error("Lỗi khi gửi thông báo vi phạm tới Admin", e);
        }

        return mapToReportResponse(saved);
    }

    @Override
    @Transactional
    public void markAsRead(String staffEmail, Long conversationId) {
        conversationRepository.markStaffRead(conversationId);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<SupportConversationResponse> getConversationHistory(String staffEmail, Pageable pageable) {
        User staff = getUserByEmail(staffEmail);

        Page<SupportConversation> page;
        if (isAdmin(staff)) {
            page = conversationRepository.findByStatusInOrderByLastMessageAtDesc(
                    List.of("RESOLVED", "CLOSED"), pageable);
        } else {
            page = conversationRepository.findByStaffIdAndStatusInOrderByLastMessageAtDesc(
                    staff.getId(), List.of("RESOLVED", "CLOSED"), pageable);
        }
        return page.map(this::mapToStaffConversationResponse);
    }

    private void pushRealtimeMessage(SupportConversation conversation, SupportMessageResponse msg) {
        try {
            // Gửi cho khách hàng
            messagingTemplate.convertAndSendToUser(
                    String.valueOf(conversation.getCustomer().getId()),
                    "/queue/support-chat",
                    msg
            );

            // Gửi cho nhân viên
            if (conversation.getStaff() != null) {
                messagingTemplate.convertAndSendToUser(
                        String.valueOf(conversation.getStaff().getId()),
                        "/queue/support-chat",
                        msg
                );
            }
        } catch (Exception e) {
            log.error("Lỗi đẩy WebSocket tin nhắn", e);
        }
    }

    private void notifyStaffQueueUpdated() {
        try {
            messagingTemplate.convertAndSend("/topic/support-queue", "QUEUE_UPDATED");
        } catch (Exception e) {
            log.error("Lỗi broadcast hàng đợi nhân viên", e);
        }
    }

    private User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy thông tin tài khoản nhân viên"));
    }

    private SupportConversation getConversationById(Long id) {
        return conversationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy phiên hỗ trợ"));
    }

    private boolean isAdmin(User user) {
        return user.getRole() != null &&
                ("ROLE_ADMIN".equalsIgnoreCase(user.getRole().getName()) || "ADMIN".equalsIgnoreCase(user.getRole().getName()));
    }

    private void validateStaffCanOperate(SupportConversation conversation, User staff) {
        if (isAdmin(staff)) {
            return;
        }
        if (conversation.getStaff() != null && !conversation.getStaff().getId().equals(staff.getId())) {
            throw new IllegalArgumentException("Bạn không phải là nhân viên phụ trách ca hỗ trợ này (Phụ trách: "
                    + conversation.getStaff().getName() + ").");
        }
    }

    private SupportConversationResponse mapToStaffConversationResponse(SupportConversation c) {
        long unread = messageRepository.countUnreadForStaff(c.getId(), c.getStaffLastReadAt());
        return SupportConversationResponse.builder()
                .id(c.getId())
                .customerId(c.getCustomer().getId())
                .customerName(c.getCustomer().getName())
                .customerEmail(c.getCustomer().getEmail())
                .customerPhone(c.getCustomer().getPhoneNumber())
                .customerAvatar(c.getCustomer().getAvatar())
                .staffId(c.getStaff() != null ? c.getStaff().getId() : null)
                .staffName(c.getStaff() != null ? c.getStaff().getName() : null)
                .staffAvatar(c.getStaff() != null ? c.getStaff().getAvatar() : null)
                .orderId(c.getOrder() != null ? c.getOrder().getId() : null)
                .orderCode(c.getOrder() != null ? c.getOrder().getOrderCode() : null)
                .status(c.getStatus())
                .subject(c.getSubject())
                .unreadCount(unread)
                .rating(c.getRating())
                .feedbackNote(c.getFeedbackNote())
                .lastMessageAt(c.getLastMessageAt())
                .acceptedAt(c.getAcceptedAt())
                .closedAt(c.getClosedAt())
                .createdAt(c.getCreatedAt())
                .build();
    }

    private SupportMessageResponse mapToMessageResponse(SupportMessage m) {
        return SupportMessageResponse.builder()
                .id(m.getId())
                .conversationId(m.getConversation().getId())
                .senderId(m.getSender() != null ? m.getSender().getId() : null)
                .senderName(m.getSender() != null ? m.getSender().getName() : "Hệ thống AP Sports")
                .senderRole(m.getSenderRole())
                .content(m.getContent())
                .attachmentUrl(m.getAttachmentUrl())
                .senderAvatar(m.getSender() != null ? m.getSender().getAvatar() : null)
                .conversationStatus(m.getConversation() != null ? m.getConversation().getStatus() : null)
                .createdAt(m.getCreatedAt())
                .build();
    }

    private SupportReportResponse mapToReportResponse(SupportReport r) {
        return SupportReportResponse.builder()
                .id(r.getId())
                .conversationId(r.getConversation().getId())
                .reportedCustomerId(r.getReportedCustomer().getId())
                .reportedCustomerName(r.getReportedCustomer().getName())
                .reportedCustomerEmail(r.getReportedCustomer().getEmail())
                .reportedByStaffId(r.getReportedByStaff().getId())
                .reportedByStaffName(r.getReportedByStaff().getName())
                .reason(r.getReason())
                .evidenceImageUrls(r.getEvidenceImageUrls())
                .status(r.getStatus())
                .adminNote(r.getAdminNote())
                .processedByAdminId(r.getProcessedByAdmin() != null ? r.getProcessedByAdmin().getId() : null)
                .processedByAdminName(r.getProcessedByAdmin() != null ? r.getProcessedByAdmin().getName() : null)
                .processedAt(r.getProcessedAt())
                .createdAt(r.getCreatedAt())
                .build();
    }
}
