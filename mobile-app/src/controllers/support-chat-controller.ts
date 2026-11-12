import { apiClient } from '../services/apiClient';
import { ApiResponse } from '../types';

export interface SupportMessage {
  id: number;
  senderRole?: 'CUSTOMER' | 'STAFF' | 'SYSTEM';
  senderType?: 'CUSTOMER' | 'STAFF' | 'SYSTEM';
  senderName: string;
  senderAvatar?: string;
  content: string;
  attachmentUrl?: string;
  mediaUrl?: string;
  messageType?: 'TEXT' | 'IMAGE';
  orderId?: number;
  orderCode?: string;
  createdAt: string;
}

export interface SupportConversation {
  id: number;
  customerEmail: string;
  customerName: string;
  staffName?: string;
  staffAvatar?: string;
  orderId?: number;
  orderCode?: string;
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
   * Khởi tạo ca hỗ trợ trực tuyến mới (hỗ trợ đính kèm orderId của chính khách hàng)
   */
  async getOrCreateConversation(
    subject?: string,
    orderId?: number
  ): Promise<ApiResponse<SupportConversation>> {
    const res = await apiClient.post<ApiResponse<SupportConversation>>(
      '/customer/support-chat/conversation',
      {
        subject: subject || 'Khách hàng yêu cầu hỗ trợ qua mobile app',
        orderId: orderId || undefined,
      }
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
   * Gửi tin nhắn mới tới nhân viên CSKH (hỗ trợ đính kèm orderId)
   */
  async sendMessage(
    conversationId: number,
    content: string,
    mediaUrl?: string,
    orderId?: number
  ): Promise<ApiResponse<SupportMessage>> {
    const res = await apiClient.post<ApiResponse<SupportMessage>>(
      `/customer/support-chat/conversations/${conversationId}/messages`,
      {
        content: content || undefined,
        attachmentUrl: mediaUrl || undefined,
        orderId: orderId || undefined,
      }
    );
    return res.data;
  },
};
