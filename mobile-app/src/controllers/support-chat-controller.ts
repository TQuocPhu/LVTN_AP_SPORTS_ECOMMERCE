import { apiClient } from '../services/apiClient';
import { ApiResponse } from '../types';

export interface SupportMessage {
  id: number;
  senderType: 'CUSTOMER' | 'STAFF' | 'SYSTEM';
  senderName: string;
  senderAvatar?: string;
  content: string;
  mediaUrl?: string;
  messageType?: 'TEXT' | 'IMAGE';
  createdAt: string;
}

export interface SupportConversation {
  id: number;
  customerEmail: string;
  customerName: string;
  staffName?: string;
  staffAvatar?: string;
  status: 'WAITING' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  lastMessageSnippet?: string;
  lastMessageTime?: string;
}

export const supportChatController = {
  /**
   * Lấy ca hỗ trợ đang hoạt động của khách hàng
   */
  async getActiveConversation(): Promise<ApiResponse<SupportConversation | null>> {
    const res = await apiClient.get<ApiResponse<SupportConversation | null>>(
      '/customer/support-chat/active-conversation'
    );
    return res.data;
  },

  /**
   * Khởi tạo ca hỗ trợ trực tuyến mới
   */
  async getOrCreateConversation(subject?: string): Promise<ApiResponse<SupportConversation>> {
    const res = await apiClient.post<ApiResponse<SupportConversation>>(
      '/customer/support-chat/conversation',
      { subject: subject || 'Khách hàng yêu cầu hỗ trợ qua mobile app' }
    );
    return res.data;
  },

  /**
   * Lấy lịch sử tin nhắn của ca hỗ trợ
   */
  async getMessages(conversationId: number): Promise<ApiResponse<SupportMessage[]>> {
    const res = await apiClient.get<ApiResponse<SupportMessage[]>>(
      `/customer/support-chat/conversations/${conversationId}/messages`
    );
    return res.data;
  },

  /**
   * Gửi tin nhắn mới tới nhân viên CSKH
   */
  async sendMessage(
    conversationId: number,
    content: string,
    mediaUrl?: string
  ): Promise<ApiResponse<SupportMessage>> {
    const res = await apiClient.post<ApiResponse<SupportMessage>>(
      `/customer/support-chat/conversations/${conversationId}/messages`,
      {
        content,
        messageType: mediaUrl ? 'IMAGE' : 'TEXT',
        mediaUrl: mediaUrl || null,
      }
    );
    return res.data;
  },
};
