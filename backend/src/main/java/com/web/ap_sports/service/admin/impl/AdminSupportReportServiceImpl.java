package com.web.ap_sports.service.admin.impl;

import com.web.ap_sports.dto.request.support.ProcessSupportReportRequest;
import com.web.ap_sports.dto.request.support.RejectSupportReportRequest;
import com.web.ap_sports.dto.response.support.SupportMessageResponse;
import com.web.ap_sports.dto.response.support.SupportReportResponse;
import com.web.ap_sports.entity.SupportConversation;
import com.web.ap_sports.entity.SupportMessage;
import com.web.ap_sports.entity.SupportReport;
import com.web.ap_sports.entity.User;
import com.web.ap_sports.enums.UserStatus;
import com.web.ap_sports.exception.ResourceNotFoundException;
import com.web.ap_sports.repository.SupportConversationRepository;
import com.web.ap_sports.repository.SupportMessageRepository;
import com.web.ap_sports.repository.SupportReportRepository;
import com.web.ap_sports.repository.UserRepository;
import com.web.ap_sports.service.admin.AdminSupportReportService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Triển khai nghiệp vụ phê duyệt và xử lý báo cáo vi phạm dành riêng cho Quản trị viên (Admin).
 * Tuân thủ nghiêm ngặt:
 * 1. Bám sát enum UserStatus hiện có (chuyển sang UserStatus.banned khi khóa tài khoản).
 * 2. Lưu vết kiểm toán (Audit Trail) đầy đủ: người duyệt, thời gian duyệt, ghi chú xử lý.
 * 3. Đồng bộ trạng thái theo thời gian thực (Realtime WebSocket) tới nhân viên và khách hàng.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AdminSupportReportServiceImpl implements AdminSupportReportService {

    private final SupportReportRepository reportRepository;
    private final SupportConversationRepository conversationRepository;
    private final SupportMessageRepository messageRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @Override
    @Transactional(readOnly = true)
    public List<SupportReportResponse> getPendingReports() {
        return reportRepository.findByStatusOrderByCreatedAtDesc("PENDING").stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public Page<SupportReportResponse> getReports(String status, Pageable pageable) {
        String queryStatus = (status == null || status.isBlank() || "ALL".equalsIgnoreCase(status))
                ? "PENDING"
                : status.trim().toUpperCase();
        return reportRepository.findByStatusOrderByCreatedAtDesc(queryStatus, pageable)
                .map(this::mapToResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public SupportReportResponse getPendingReportByConversation(Long conversationId) {
        return reportRepository.findFirstByConversationIdAndStatusOrderByCreatedAtDesc(conversationId, "PENDING")
                .map(this::mapToResponse)
                .orElse(null);
    }

    @Override
    @Transactional
    public SupportReportResponse processReport(String adminEmail, Long reportId, ProcessSupportReportRequest request) {
        User admin = getAdminByEmail(adminEmail);
        SupportReport report = getReportById(reportId);

        if (!"PENDING".equalsIgnoreCase(report.getStatus())) {
            throw new IllegalArgumentException("Báo cáo vi phạm này đã được xử lý trước đó (Trạng thái hiện tại: " + report.getStatus() + ").");
        }

        LocalDateTime now = LocalDateTime.now();
        report.setStatus("PROCESSED");
        report.setProcessedByAdmin(admin);
        report.setProcessedAt(now);
        report.setAdminNote(request != null && request.getAdminNote() != null ? request.getAdminNote().trim() : "Quản trị viên đã phê duyệt báo cáo vi phạm.");

        // Nếu Admin lựa chọn khóa tài khoản khách hàng (mặc định là true)
        if (request != null && request.isBanCustomer()) {
            User customer = report.getReportedCustomer();
            if (customer != null) {
                // Cập nhật trạng thái khách hàng sang UserStatus.banned theo đúng enum hiện có
                customer.setStatus(UserStatus.banned);
                userRepository.save(customer);
                log.info("Admin {} đã khóa tài khoản khách hàng {} (ID: {}) do vi phạm chuẩn mực.",
                        admin.getEmail(), customer.getEmail(), customer.getId());
            }

            // Đóng ca hỗ trợ liên quan
            SupportConversation conversation = report.getConversation();
            if (conversation != null && !"CLOSED".equalsIgnoreCase(conversation.getStatus())) {
                conversation.setStatus("CLOSED");
                conversation.setClosedAt(now);
                conversationRepository.save(conversation);

                // Gửi tin nhắn hệ thống thông báo ca hỗ trợ đã bị khóa
                SupportMessage banMsg = SupportMessage.builder()
                        .conversation(conversation)
                        .sender(null)
                        .senderRole("SYSTEM")
                        .content("Tài khoản của quý khách đã bị tạm khóa do vi phạm tiêu chuẩn cộng đồng của hệ thống AP Sports. Ca hỗ trợ này hiện đã đóng.")
                        .createdAt(now)
                        .build();
                SupportMessage savedMsg = messageRepository.save(banMsg);

                // Bắn WebSocket thông báo đóng ca ngay lập tức
                pushRealtimeMessage(conversation, mapToMessageResponse(savedMsg));
            }
        }

        SupportReport saved = reportRepository.save(report);

        // Phát tín hiệu broadcast cập nhật hàng đợi để giao diện Staff/Admin refresh ngay lập tức
        broadcastQueueUpdated();

        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public SupportReportResponse rejectReport(String adminEmail, Long reportId, RejectSupportReportRequest request) {
        User admin = getAdminByEmail(adminEmail);
        SupportReport report = getReportById(reportId);

        if (!"PENDING".equalsIgnoreCase(report.getStatus())) {
            throw new IllegalArgumentException("Báo cáo vi phạm này đã được xử lý trước đó (Trạng thái hiện tại: " + report.getStatus() + ").");
        }

        LocalDateTime now = LocalDateTime.now();
        report.setStatus("REJECTED");
        report.setProcessedByAdmin(admin);
        report.setProcessedAt(now);
        report.setAdminNote(request.getAdminNote() != null ? request.getAdminNote().trim() : "Quản trị viên từ chối xử phạt.");

        SupportReport saved = reportRepository.save(report);

        log.info("Admin {} đã bác bỏ báo cáo vi phạm #{} với lý do: {}",
                admin.getEmail(), report.getId(), report.getAdminNote());

        // Phát tín hiệu broadcast cập nhật hàng đợi để giao diện Staff mở lại nút báo cáo
        broadcastQueueUpdated();

        return mapToResponse(saved);
    }

    private User getAdminByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy thông tin tài khoản Quản trị viên"));
        if (user.getRole() == null || (!"ROLE_ADMIN".equalsIgnoreCase(user.getRole().getName()) && !"ADMIN".equalsIgnoreCase(user.getRole().getName()))) {
            throw new org.springframework.security.access.AccessDeniedException("Bạn không có quyền thực hiện thao tác quản trị này");
        }
        return user;
    }

    private SupportReport getReportById(Long id) {
        return reportRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy báo cáo vi phạm với ID: " + id));
    }

    private void pushRealtimeMessage(SupportConversation conversation, SupportMessageResponse msg) {
        try {
            if (conversation.getCustomer() != null) {
                messagingTemplate.convertAndSendToUser(
                        String.valueOf(conversation.getCustomer().getId()),
                        "/queue/support-chat",
                        msg
                );
            }
            if (conversation.getStaff() != null) {
                messagingTemplate.convertAndSendToUser(
                        String.valueOf(conversation.getStaff().getId()),
                        "/queue/support-chat",
                        msg
                );
            }
        } catch (Exception e) {
            log.error("Lỗi gửi tin nhắn realtime WebSocket: {}", e.getMessage());
        }
    }

    private void broadcastQueueUpdated() {
        try {
            messagingTemplate.convertAndSend("/topic/support-queue", "QUEUE_UPDATED");
        } catch (Exception e) {
            log.error("Lỗi broadcast cập nhật hàng đợi: {}", e.getMessage());
        }
    }

    private SupportReportResponse mapToResponse(SupportReport r) {
        return SupportReportResponse.builder()
                .id(r.getId())
                .conversationId(r.getConversation() != null ? r.getConversation().getId() : null)
                .reportedCustomerId(r.getReportedCustomer() != null ? r.getReportedCustomer().getId() : null)
                .reportedCustomerName(r.getReportedCustomer() != null ? r.getReportedCustomer().getName() : "Không rõ")
                .reportedCustomerEmail(r.getReportedCustomer() != null ? r.getReportedCustomer().getEmail() : "Không rõ")
                .reportedByStaffId(r.getReportedByStaff() != null ? r.getReportedByStaff().getId() : null)
                .reportedByStaffName(r.getReportedByStaff() != null ? r.getReportedByStaff().getName() : "Không rõ")
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

    private SupportMessageResponse mapToMessageResponse(SupportMessage m) {
        return SupportMessageResponse.builder()
                .id(m.getId())
                .conversationId(m.getConversation().getId())
                .senderId(m.getSender() != null ? m.getSender().getId() : null)
                .senderName("Hệ thống AP Sports")
                .senderRole(m.getSenderRole())
                .content(m.getContent())
                .createdAt(m.getCreatedAt())
                .build();
    }
}

