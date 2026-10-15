package com.web.ap_sports.service.customer;

import com.web.ap_sports.dto.request.support.CreateConversationRequest;
import com.web.ap_sports.dto.request.support.RateConversationRequest;
import com.web.ap_sports.dto.request.support.SendSupportMessageRequest;
import com.web.ap_sports.dto.response.support.SupportConversationResponse;
import com.web.ap_sports.dto.response.support.SupportMessageResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface CustomerSupportChatService {

    SupportConversationResponse getActiveConversation(String customerEmail);

    SupportConversationResponse getOrCreateActiveConversation(String customerEmail, CreateConversationRequest request);

    Page<SupportConversationResponse> getMyConversations(String customerEmail, Pageable pageable);

    List<SupportMessageResponse> getMessages(String customerEmail, Long conversationId);

    SupportMessageResponse sendMessage(String customerEmail, Long conversationId, SendSupportMessageRequest request);

    void markAsRead(String customerEmail, Long conversationId);

    SupportConversationResponse rateConversation(String customerEmail, Long conversationId, RateConversationRequest request);
}
