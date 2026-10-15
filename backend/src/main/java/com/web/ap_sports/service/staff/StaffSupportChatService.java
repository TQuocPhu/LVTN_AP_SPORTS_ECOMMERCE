package com.web.ap_sports.service.staff;

import com.web.ap_sports.dto.request.support.CreateSupportReportRequest;
import com.web.ap_sports.dto.request.support.SendSupportMessageRequest;
import com.web.ap_sports.dto.response.support.SupportConversationResponse;
import com.web.ap_sports.dto.response.support.SupportMessageResponse;
import com.web.ap_sports.dto.response.support.SupportReportResponse;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface StaffSupportChatService {

    List<SupportConversationResponse> getWaitingQueue();

    List<SupportConversationResponse> getMyActiveConversations(String staffEmail);

    SupportConversationResponse acceptConversation(String staffEmail, Long conversationId);

    List<SupportMessageResponse> getMessages(String staffEmail, Long conversationId);

    SupportMessageResponse sendMessage(String staffEmail, Long conversationId, SendSupportMessageRequest request);

    SupportConversationResponse resolveConversation(String staffEmail, Long conversationId);

    SupportReportResponse reportCustomer(String staffEmail, Long conversationId, CreateSupportReportRequest request);

    Page<SupportConversationResponse> getConversationHistory(String staffEmail, org.springframework.data.domain.Pageable pageable);

    void markAsRead(String staffEmail, Long conversationId);
}
