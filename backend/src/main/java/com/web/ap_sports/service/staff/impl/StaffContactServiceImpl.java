package com.web.ap_sports.service.staff.impl;

import com.web.ap_sports.dto.request.staff.ReplyContactRequest;
import com.web.ap_sports.dto.response.customer.ContactResponse;
import com.web.ap_sports.entity.Contact;
import com.web.ap_sports.entity.User;
import com.web.ap_sports.exception.AppException;
import com.web.ap_sports.repository.ContactRepository;
import com.web.ap_sports.repository.UserRepository;
import com.web.ap_sports.service.common.CloudinaryService;
import com.web.ap_sports.service.common.EmailService;
import com.web.ap_sports.service.staff.StaffContactService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class StaffContactServiceImpl implements StaffContactService {

    private static final String CONTACTS_FOLDER = "ap-sports-e-commerce/contacts";
    private static final Pattern BASE64_IMAGE_PATTERN =
            Pattern.compile("src=[\"'](data:image/[^;]+;base64,[^\"']+)[\"']", Pattern.CASE_INSENSITIVE);

    private final ContactRepository contactRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;
    private final CloudinaryService cloudinaryService;

    @Override
    @Transactional(readOnly = true)
    public Page<ContactResponse> getAllContacts(String keyword, String status, Pageable pageable) {
        String cleanKeyword = (keyword != null && !keyword.isBlank()) ? keyword.trim() : null;
        String cleanStatus = (status != null && !status.isBlank()) ? status.trim() : null;

        Page<Contact> page = contactRepository.searchContacts(cleanKeyword, cleanStatus, pageable);
        return page.map(this::mapToResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public ContactResponse getContactById(Long id) {
        Contact contact = contactRepository.findById(id)
                .orElseThrow(() -> new AppException("Yêu cầu liên hệ không tồn tại", HttpStatus.NOT_FOUND));
        return mapToResponse(contact);
    }

    @Override
    @Transactional
    public ContactResponse replyContact(Long id, ReplyContactRequest request, String userEmail) {
        Contact contact = contactRepository.findById(id)
                .orElseThrow(() -> new AppException("Yêu cầu liên hệ không tồn tại", HttpStatus.NOT_FOUND));

        if ("replied".equalsIgnoreCase(contact.getStatus())) {
            throw new AppException("Yêu cầu liên hệ này đã được phản hồi trước đó rồi, không thể gửi lại.", HttpStatus.BAD_REQUEST);
        }

        User staff = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new AppException("Tài khoản người dùng không tồn tại", HttpStatus.NOT_FOUND));

        String replyHtmlMessage = request.getReplyMessage() != null ? request.getReplyMessage().trim() : "";

        // Tự động upload toàn bộ ảnh Base64 trong replyMessage lên Cloudinary SONG SONG
        if (StringUtils.hasText(replyHtmlMessage)) {
            replyHtmlMessage = uploadInlineBase64ImagesToCloudinary(replyHtmlMessage);
        }

        contact.setReplyMessage(replyHtmlMessage);
        contact.setStatus("replied");
        contact.setRepliedBy(staff);
        contact.setRepliedAt(LocalDateTime.now());

        Contact updated = contactRepository.save(contact);

        // Gửi Email HTML phản hồi cho khách hàng qua Spring Mail
        try {
            emailService.sendContactReplyEmail(
                    updated.getEmail(),
                    updated.getName(),
                    updated.getMessage(),
                    updated.getReplyMessage()
            );
        } catch (Exception e) {
            // Email failure logged silently so response still succeeds
        }

        return mapToResponse(updated);
    }

    private String uploadInlineBase64ImagesToCloudinary(String html) {
        if (!StringUtils.hasText(html)) return html;

        Matcher matcher = BASE64_IMAGE_PATTERN.matcher(html);
        List<String> base64Sources = new ArrayList<>();
        while (matcher.find()) {
            base64Sources.add(matcher.group(1));
        }

        if (base64Sources.isEmpty()) {
            return html;
        }

        // Upload tất cả ảnh Base64 lên Cloudinary trong thư mục "ap-sports-e-commerce/contacts"
        Map<String, String> uploadedUrlMap = cloudinaryService.uploadBase64OrUrlBatch(base64Sources, CONTACTS_FOLDER);

        matcher.reset();
        StringBuffer sb = new StringBuffer();
        while (matcher.find()) {
            String rawSource = matcher.group(1);
            String cloudinaryUrl = uploadedUrlMap.getOrDefault(rawSource, rawSource);
            matcher.appendReplacement(sb, "src=\"" + cloudinaryUrl + "\"");
        }
        matcher.appendTail(sb);
        return sb.toString();
    }

    private ContactResponse mapToResponse(Contact contact) {
        return ContactResponse.builder()
                .id(contact.getId())
                .name(contact.getName())
                .email(contact.getEmail())
                .phone(contact.getPhone())
                .message(contact.getMessage())
                .status(contact.getStatus())
                .replyMessage(contact.getReplyMessage())
                .repliedByUserId(contact.getRepliedBy() != null ? contact.getRepliedBy().getId() : null)
                .repliedByName(contact.getRepliedBy() != null ? contact.getRepliedBy().getName() : null)
                .repliedAt(contact.getRepliedAt())
                .createdAt(contact.getCreatedAt())
                .updatedAt(contact.getUpdatedAt())
                .build();
    }
}
