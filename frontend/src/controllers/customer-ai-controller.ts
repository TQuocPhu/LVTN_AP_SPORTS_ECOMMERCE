import { apiClient, ApiResponse } from '@/services/api-client';
import {
  AiSportsAdvisorRequest,
  AiSportsAdvisorResponse,
  ChatMessageDto,
  AiReviewSummaryResponse,
} from '@/types/ai';

/**
 * Controller Frontend điều phối các yêu cầu AI từ khách hàng (Agent 1 & Agent 4) tới Backend Spring Boot
 */
export const customerAiController = {
  /**
   * Gửi câu hỏi tư vấn kích thước và trang bị thể thao tới AI Sports Advisor
   */
  async askAdvisor(data: AiSportsAdvisorRequest): Promise<ApiResponse<AiSportsAdvisorResponse>> {
    return apiClient.post<ApiResponse<AiSportsAdvisorResponse>>('/customer/ai/advisor', data, {
      suppressErrorToast: true,
      showSuccessToast: false,
    });
  },

  /**
   * Lấy lịch sử hội thoại tư vấn đã lưu trong CSDL
   */
  async getChatHistory(guestToken?: string): Promise<ApiResponse<ChatMessageDto[]>> {
    const url = guestToken
      ? `/customer/ai/advisor/history?guestToken=${encodeURIComponent(guestToken)}`
      : '/customer/ai/advisor/history';
    return apiClient.get<ApiResponse<ChatMessageDto[]>>(url, {
      suppressErrorToast: true,
    });
  },

  /**
   * Lấy tóm tắt và phân tích cảm xúc từ các đánh giá thực tế của một sản phẩm
   */
  async getReviewSummary(productId: number): Promise<ApiResponse<AiReviewSummaryResponse>> {
    return apiClient.get<ApiResponse<AiReviewSummaryResponse>>(`/customer/ai/reviews/${productId}/summary`, {
      suppressErrorToast: true,
    });
  },
};
