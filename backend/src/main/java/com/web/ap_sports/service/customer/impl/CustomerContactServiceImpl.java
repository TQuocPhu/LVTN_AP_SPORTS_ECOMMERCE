package com.web.ap_sports.service.customer.impl;

import com.web.ap_sports.dto.request.customer.CreateContactRequest;
import com.web.ap_sports.dto.response.customer.ContactResponse;
import com.web.ap_sports.entity.Contact;
import com.web.ap_sports.repository.ContactRepository;
import com.web.ap_sports.service.customer.CustomerContactService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CustomerContactServiceImpl implements CustomerContactService {

    private final ContactRepository contactRepository;

    @Override
    @Transactional
    public ContactResponse createContact(CreateContactRequest request) {
        Contact contact = Contact.builder()
                .name(request.getName().trim())
                .email(request.getEmail().trim().toLowerCase())
                .phone(request.getPhone() != null ? request.getPhone().trim() : null)
                .message(request.getMessage().trim())
                .status("pending")
                .build();

        Contact saved = contactRepository.save(contact);
        return mapToResponse(saved);
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
