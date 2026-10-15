import { apiClient, ApiResponse, BASE_URL } from '@/services/api-client';
import {
  SupportConversation,
  SupportMessage,
  SupportReport,
  CreateConversationRequest,
  SendSupportMessageRequest,
  RateConversationRequest,
  CreateSupportReportRequest,
} from '@/types/support-chat';

export const supportChatController = {

  // =========================================================================
  // 1. DÀNH CHO KHÁCH HÀNG (CUSTOMER)
  // =========================================================================

  /**
   * Lấy ca hỗ trợ đang hoạt động của khách hàng (WAITING, IN_PROGRESS hoặc RESOLVED chưa đánh giá).
   * Trả về null nếu không có ca active, không tự động tạo ca rác.
   */
  async getActiveConversation(): Promise<ApiResponse<SupportConversation | null>> {
    return apiClient.get<ApiResponse<SupportConversation | null>>(
      '/customer/support-chat/active-conversation',
      { showSuccessToast: false, suppressErrorToast: true }
    );
  },

  /**
   * Khởi tạo ca mới khi khách hàng thực sự gửi tin nhắn đầu tiên.
   * Dùng suppressErrorToast: true và showSuccessToast: false.
   */
  async getOrCreateConversation(
    data?: CreateConversationRequest
  ): Promise<ApiResponse<SupportConversation>> {
    return apiClient.post<ApiResponse<SupportConversation>>(
      '/customer/support-chat/conversation',
      data || {},
      { showSuccessToast: false, suppressErrorToast: true }
    );
  },

  /**
   * Lấy lịch sử các ca hỗ trợ của khách hàng.
   */
  async getMyConversations(
    page = 0,
    size = 10
  ): Promise<ApiResponse<{ content: SupportConversation[]; totalElements: number }>> {
    return apiClient.get<ApiResponse<{ content: SupportConversation[]; totalElements: number }>>(
      `/customer/support-chat/conversations?page=${page}&size=${size}`,
      { suppressErrorToast: true }
    );
  },

  /**
   * Lấy danh sách tin nhắn của một ca hỗ trợ (phía khách hàng).
   */
  async getMessages(conversationId: number): Promise<ApiResponse<SupportMessage[]>> {
    return apiClient.get<ApiResponse<SupportMessage[]>>(
      `/customer/support-chat/conversations/${conversationId}/messages`,
      { suppressErrorToast: true }
    );
  },

  /**
   * Gửi tin nhắn mới (text hoặc kèm link ảnh Cloudinary).
   * Không hiển thị toast thành công khi gửi tin nhắn (tin nhắn tự hiện trên UI).
   */
  async sendMessage(
    conversationId: number,
    data: SendSupportMessageRequest
  ): Promise<ApiResponse<SupportMessage>> {
    return apiClient.post<ApiResponse<SupportMessage>>(
      `/customer/support-chat/conversations/${conversationId}/messages`,
      data,
      { showSuccessToast: false, suppressErrorToast: true }
    );
  },

  /**
   * Đánh dấu khách hàng đã đọc toàn bộ tin nhắn trong ca.
   */
  async markAsRead(conversationId: number): Promise<ApiResponse<void>> {
    return apiClient.post<ApiResponse<void>>(
      `/customer/support-chat/conversations/${conversationId}/read`,
      {},
      { showSuccessToast: false, suppressErrorToast: true }
    );
  },

  /**
   * Đánh giá 1-5 sao sau khi ca hỗ trợ được giải quyết.
   */
  async rateConversation(
    conversationId: number,
    data: RateConversationRequest
  ): Promise<ApiResponse<SupportConversation>> {
    return apiClient.post<ApiResponse<SupportConversation>>(
      `/customer/support-chat/conversations/${conversationId}/rate`,
      data,
      { showSuccessToast: true, suppressErrorToast: false }
    );
  },

  // =========================================================================
  // 2. DÀNH CHO NHÂN VIÊN & QUẢN TRỊ VIÊN (STAFF & ADMIN)
  // =========================================================================

  /**
   * Lấy hàng đợi các ca hỗ trợ đang chờ nhân viên tiếp nhận (WAITING).
   */
  async getWaitingQueue(): Promise<ApiResponse<SupportConversation[]>> {
    return apiClient.get<ApiResponse<SupportConversation[]>>(
      '/staff/support-chat/queue',
      { suppressErrorToast: true }
    );
  },

  /**
   * Lấy danh sách các ca mà nhân viên đang trực tiếp phụ trách (IN_PROGRESS).
   */
  async getMyActiveConversations(): Promise<ApiResponse<SupportConversation[]>> {
    return apiClient.get<ApiResponse<SupportConversation[]>>(
      '/staff/support-chat/my-conversations',
      { suppressErrorToast: true }
    );
  },

  /**
   * Lấy lịch sử các ca hỗ trợ đã hoàn tất hoặc đã đóng (phía nhân viên/quản trị).
   */
  async getStaffHistory(
    page = 0,
    size = 20
  ): Promise<ApiResponse<{ content: SupportConversation[]; totalElements: number }>> {
    return apiClient.get<ApiResponse<{ content: SupportConversation[]; totalElements: number }>>(
      `/staff/support-chat/history?page=${page}&size=${size}`,
      { suppressErrorToast: true }
    );
  },

  /**
   * Nhân viên nhận tiếp nhận ca hỗ trợ (Atomic Update).
   */
  async acceptConversation(conversationId: number): Promise<ApiResponse<SupportConversation>> {
    return apiClient.post<ApiResponse<SupportConversation>>(
      `/staff/support-chat/conversations/${conversationId}/accept`,
      {},
      { showSuccessToast: true, suppressErrorToast: false }
    );
  },

  /**
   * Lấy lịch sử tin nhắn của ca hỗ trợ (phía nhân viên).
   */
  async getStaffMessages(conversationId: number): Promise<ApiResponse<SupportMessage[]>> {
    return apiClient.get<ApiResponse<SupportMessage[]>>(
      `/staff/support-chat/conversations/${conversationId}/messages`,
      { suppressErrorToast: true }
    );
  },

  /**
   * Nhân viên gửi tin nhắn phản hồi cho khách hàng.
   */
  async sendStaffMessage(
    conversationId: number,
    data: SendSupportMessageRequest
  ): Promise<ApiResponse<SupportMessage>> {
    return apiClient.post<ApiResponse<SupportMessage>>(
      `/staff/support-chat/conversations/${conversationId}/messages`,
      data,
      { showSuccessToast: false, suppressErrorToast: true }
    );
  },

  /**
   * Đánh dấu hoàn tất / giải quyết xong vấn đề cho khách (RESOLVED).
   */
  async resolveConversation(conversationId: number): Promise<ApiResponse<SupportConversation>> {
    return apiClient.post<ApiResponse<SupportConversation>>(
      `/staff/support-chat/conversations/${conversationId}/resolve`,
      {},
      { showSuccessToast: true, suppressErrorToast: false }
    );
  },

  /**
   * Nhân viên gửi Báo Cáo Vi Phạm (Report) của khách hàng lên Ban Quản Trị (Admin).
   */
  async reportCustomer(
    conversationId: number,
    data: CreateSupportReportRequest
  ): Promise<ApiResponse<SupportReport>> {
    return apiClient.post<ApiResponse<SupportReport>>(
      `/staff/support-chat/conversations/${conversationId}/report`,
      data,
      { showSuccessToast: true, suppressErrorToast: false }
    );
  },

  /**
   * Đánh dấu nhân viên đã đọc tin nhắn trong ca.
   */
  async markStaffAsRead(conversationId: number): Promise<ApiResponse<void>> {
    return apiClient.post<ApiResponse<void>>(
      `/staff/support-chat/conversations/${conversationId}/read`,
      {},
      { showSuccessToast: false, suppressErrorToast: true }
    );
  },

  // =========================================================================
  // 3. TẢI ẢNH LÊN CLOUDINARY
  // =========================================================================

  /**
   * Tải ảnh đính kèm vào tin nhắn cuộc trò chuyện (Khách & Nhân viên).
   * Lưu trữ tại: ap-sports-e-commerce/support-chat/messages/
   */
  async uploadMessageImage(file: File): Promise<{ url: string; publicId: string }> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${BASE_URL}/support-chat/upload-message-image`, {
      method: 'POST',
      body: formData,
      credentials: 'include',
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || 'Không thể tải ảnh tin nhắn lên Cloudinary.');
    }

    const json = await response.json();
    return json.data;
  },

  /**
   * Tải ảnh bằng chứng vi phạm khi báo cáo khách hàng lên Ban Quản Trị (Tối đa 3 ảnh).
   * Lưu trữ tại: ap-sports-e-commerce/support-chat/reports/
   */
  async uploadReportEvidence(files: File[]): Promise<string[]> {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));

    const response = await fetch(`${BASE_URL}/support-chat/upload-report-evidence`, {
      method: 'POST',
      body: formData,
      credentials: 'include',
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || 'Không thể tải ảnh bằng chứng vi phạm lên Cloudinary.');
    }

    const json = await response.json();
    return json.data;
  },
};
