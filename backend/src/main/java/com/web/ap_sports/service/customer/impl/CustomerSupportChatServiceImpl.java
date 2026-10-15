package com.web.ap_sports.service.customer.impl;

import com.web.ap_sports.dto.request.support.CreateConversationRequest;
import com.web.ap_sports.dto.request.support.RateConversationRequest;
import com.web.ap_sports.dto.request.support.SendSupportMessageRequest;
import com.web.ap_sports.dto.response.support.SupportConversationResponse;
import com.web.ap_sports.dto.response.support.SupportMessageResponse;
import com.web.ap_sports.entity.Order;
import com.web.ap_sports.entity.SupportConversation;
import com.web.ap_sports.entity.SupportMessage;
import com.web.ap_sports.entity.User;
import com.web.ap_sports.exception.AppException;
import com.web.ap_sports.exception.ResourceNotFoundException;
import org.springframework.http.HttpStatus;
import com.web.ap_sports.repository.OrderRepository;
import com.web.ap_sports.repository.SupportConversationRepository;
import com.web.ap_sports.repository.SupportMessageRepository;
import com.web.ap_sports.repository.UserRepository;
import com.web.ap_sports.service.customer.CustomerSupportChatService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class CustomerSupportChatServiceImpl implements CustomerSupportChatService {

    private final SupportConversationRepository conversationRepository;
    private final SupportMessageRepository messageRepository;
    private final UserRepository userRepository;
    private final OrderRepository orderRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @Override
    @Transactional(readOnly = true)
    public SupportConversationResponse getActiveConversation(String customerEmail) {
        User customer = getUserByEmail(customerEmail);
        List<SupportConversation> activeList = conversationRepository
                .findActiveConversationsForCustomer(customer.getId());

        if (activeList.isEmpty()) {
            return null;
        }

        return mapToConversationResponse(activeList.get(0), customer.getId());
    }

    @Override
    @Transactional
    public SupportConversationResponse getOrCreateActiveConversation(String customerEmail,
            CreateConversationRequest request) {
        User customer = getUserByEmail(customerEmail);

        // 1. Chống mở nhiều ca: Nếu khách có ca WAITING hoặc IN_PROGRESS thì trả về ca
        // cũ
        List<SupportConversation> activeList = conversationRepository
                .findActiveConversationsForCustomer(customer.getId());

        if (!activeList.isEmpty()) {
            return mapToConversationResponse(activeList.get(0), customer.getId());
        }

        // 2. Tạo ca mới
        Order linkedOrder = null;
        if (request != null && request.getOrderId() != null) {
            linkedOrder = orderRepository.findById(request.getOrderId()).orElse(null);
        }

        String subject = (request != null && request.getSubject() != null && !request.getSubject().isBlank())
                ? request.getSubject().trim()
                : "Hỗ trợ khách hàng trực tuyến";

        LocalDateTime now = LocalDateTime.now();
        SupportConversation conversation = SupportConversation.builder()
                .customer(customer)
                .order(linkedOrder)
                .subject(subject)
                .status("WAITING")
                .createdAt(now)
                .updatedAt(now)
                .lastMessageAt(now)
                .customerLastReadAt(now)
                .build();

        SupportConversation saved = conversationRepository.save(conversation);

        // Tạo tin nhắn chào mừng từ hệ thống
        SupportMessage welcomeMsg = SupportMessage.builder()
                .conversation(saved)
                .sender(null) // SYSTEM
                .senderRole("SYSTEM")
                .content(
                        "Yêu cầu hỗ trợ đã được tạo. Chuyên viên AP Sports sẽ tiếp nhận cuộc trò chuyện trong giây lát.")
                .createdAt(now)
                .build();
        messageRepository.save(welcomeMsg);

        // Broadcast hàng đợi cho các nhân viên trực ca
        notifyStaffQueueUpdated();

        return mapToConversationResponse(saved, customer.getId());
    }

    @Override
    @Transactional(readOnly = true)
    public Page<SupportConversationResponse> getMyConversations(String customerEmail, Pageable pageable) {
        User customer = getUserByEmail(customerEmail);
        return conversationRepository.findByCustomerIdOrderByLastMessageAtDesc(customer.getId(), pageable)
                .map(c -> mapToConversationResponse(c, customer.getId()));
    }

    @Override
    @Transactional
    public List<SupportMessageResponse> getMessages(String customerEmail, Long conversationId) {
        User customer = getUserByEmail(customerEmail);
        SupportConversation conversation = getConversationById(conversationId);
        validateConversationOwner(conversation, customer.getId());

        // Cập nhật customer_last_read_at
        conversationRepository.markCustomerRead(conversationId);

        return messageRepository.findByConversationIdOrderByCreatedAtAsc(conversationId).stream()
                .map(this::mapToMessageResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public SupportMessageResponse sendMessage(String customerEmail, Long conversationId,
            SendSupportMessageRequest request) {
        User customer = getUserByEmail(customerEmail);
        SupportConversation conversation = getConversationById(conversationId);
        validateConversationOwner(conversation, customer.getId());

        if ("CLOSED".equalsIgnoreCase(conversation.getStatus())
                || "RESOLVED".equalsIgnoreCase(conversation.getStatus())) {
            throw new IllegalArgumentException("Ca hỗ trợ này đã kết thúc. Bạn vui lòng mở yêu cầu hỗ trợ mới.");
        }

        String content = request.getContent() != null ? request.getContent().trim() : null;
        String attachmentUrl = request.getAttachmentUrl() != null ? request.getAttachmentUrl().trim() : null;

        if ((content == null || content.isEmpty()) && (attachmentUrl == null || attachmentUrl.isEmpty())) {
            throw new IllegalArgumentException("Nội dung tin nhắn hoặc ảnh đính kèm không được để trống.");
        }

        LocalDateTime now = LocalDateTime.now();
        SupportMessage message = SupportMessage.builder()
                .conversation(conversation)
                .sender(customer)
                .senderRole("CUSTOMER")
                .content(content)
                .attachmentUrl(attachmentUrl)
                .createdAt(now)
                .build();

        SupportMessage saved = messageRepository.save(message);

        // Cập nhật last_message_at và customer_last_read_at
        conversation.setLastMessageAt(now);
        conversation.setCustomerLastReadAt(now);
        conversationRepository.save(conversation);

        SupportMessageResponse response = mapToMessageResponse(saved);

        // Đẩy tin nhắn realtime qua WebSocket cho cả nhân viên và khách hàng
        pushRealtimeMessage(conversation, response);

        return response;
    }

    @Override
    @Transactional
    public void markAsRead(String customerEmail, Long conversationId) {
        User customer = getUserByEmail(customerEmail);
        SupportConversation conversation = getConversationById(conversationId);
        validateConversationOwner(conversation, customer.getId());
        conversationRepository.markCustomerRead(conversationId);
    }

    @Override
    @Transactional
    public SupportConversationResponse rateConversation(String customerEmail, Long conversationId,
            RateConversationRequest request) {
        User customer = getUserByEmail(customerEmail);
        SupportConversation conversation = getConversationById(conversationId);
        validateConversationOwner(conversation, customer.getId());

        if (!"RESOLVED".equalsIgnoreCase(conversation.getStatus())
                && !"CLOSED".equalsIgnoreCase(conversation.getStatus())) {
            throw new IllegalArgumentException("Chỉ có thể đánh giá khi ca hỗ trợ đã được nhân viên giải quyết.");
        }

        conversation.setRating(request.getRating());
        conversation.setFeedbackNote(request.getFeedbackNote());
        conversation.setStatus("CLOSED");
        if (conversation.getClosedAt() == null) {
            conversation.setClosedAt(LocalDateTime.now());
        }

        SupportConversation saved = conversationRepository.save(conversation);

        // Tạo tin nhắn hệ thống ghi nhận đánh giá của khách
        SupportMessage ratingMsg = SupportMessage.builder()
                .conversation(saved)
                .sender(null)
                .senderRole("SYSTEM")
                .content("Khách hàng đã đánh giá dịch vụ: " + request.getRating() + " sao." +
                        (request.getFeedbackNote() != null && !request.getFeedbackNote().isBlank()
                                ? " Góp ý: " + request.getFeedbackNote().trim()
                                : ""))
                .createdAt(LocalDateTime.now())
                .build();
        messageRepository.save(ratingMsg);

        pushRealtimeMessage(saved, mapToMessageResponse(ratingMsg));
        notifyStaffQueueUpdated();

        return mapToConversationResponse(saved, customer.getId());
    }

    private void pushRealtimeMessage(SupportConversation conversation, SupportMessageResponse msg) {
        try {
            // 1. Gửi cho khách hàng
            messagingTemplate.convertAndSendToUser(
                    String.valueOf(conversation.getCustomer().getId()),
                    "/queue/support-chat",
                    msg);

            // 2. Gửi cho nhân viên phụ trách nếu có
            if (conversation.getStaff() != null) {
                messagingTemplate.convertAndSendToUser(
                        String.valueOf(conversation.getStaff().getId()),
                        "/queue/support-chat",
                        msg);
            } else {
                // Nếu ca WAITING, thông báo cho hàng đợi nhân viên
                notifyStaffQueueUpdated();
            }
        } catch (Exception e) {
            log.error("Lỗi đẩy WebSocket tin nhắn support", e);
        }
    }

    private void notifyStaffQueueUpdated() {
        try {
            messagingTemplate.convertAndSend("/topic/support-queue", "QUEUE_UPDATED");
        } catch (Exception e) {
            log.error("Lỗi đẩy WebSocket hàng đợi support", e);
        }
    }

    private User getUserByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy thông tin tài khoản người dùng"));

        // Chặn tuyệt đối tài khoản Quản trị viên (ADMIN) và nhân viên nội bộ
        if (user.getRole() != null && "ADMIN".equalsIgnoreCase(user.getRole().getName())) {
            throw new AppException(
                    "Tài khoản Quản trị viên (ADMIN) không được phép sử dụng tính năng Chatbot/Hỗ trợ khách hàng.",
                    HttpStatus.FORBIDDEN);
        }
        if (user.getRole() != null && !"CUSTOMER".equalsIgnoreCase(user.getRole().getName())) {
            throw new AppException("Tài khoản nội bộ không được phép sử dụng tính năng Chatbot/Hỗ trợ khách hàng.",
                    HttpStatus.FORBIDDEN);
        }

        return user;
    }

    private SupportConversation getConversationById(Long id) {
        return conversationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy phiên hỗ trợ"));
    }

    private void validateConversationOwner(SupportConversation conversation, Long customerId) {
        if (!conversation.getCustomer().getId().equals(customerId)) {
            throw new IllegalArgumentException("Bạn không có quyền truy cập phiên hỗ trợ này.");
        }
    }

    private SupportConversationResponse mapToConversationResponse(SupportConversation c, Long currentUserId) {
        long unread = messageRepository.countUnreadForCustomer(c.getId(), c.getCustomerLastReadAt());
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
}
