import { apiClient, ApiResponse } from '@/services/api-client';
import {
  AiProductContentRequest,
  AiProductContentResponse,
  AiChatSuggestRequest,
  AiChatSuggestResponse,
  AiBusinessAdvisorResponse,
} from '@/types/ai';

/**
 * Controller Frontend điều phối các yêu cầu AI quản trị (Agent 2, Agent 3, Agent 5) tới Backend Spring Boot
 */
export const adminAiController = {
  /**
   * Tự động sinh nội dung mô tả sản phẩm chuẩn SEO & HTML cho RichTextEditor
   */
  async generateProductDescription(
    data: AiProductContentRequest
  ): Promise<ApiResponse<AiProductContentResponse>> {
    return apiClient.post<ApiResponse<AiProductContentResponse>>(
      '/admin/ai/product-description',
      data,
      { suppressErrorToast: true, showSuccessToast: false }
    );
  },

  /**
   * Gợi ý 3 câu trả lời nhanh cho nhân viên CSKH theo ngữ cảnh tin nhắn
   */
  async suggestChatReplies(
    data: AiChatSuggestRequest
  ): Promise<ApiResponse<AiChatSuggestResponse>> {
    return apiClient.post<ApiResponse<AiChatSuggestResponse>>(
      '/admin/ai/chat-suggest',
      data,
      { suppressErrorToast: true, showSuccessToast: false }
    );
  },

  /**
   * Lấy báo cáo phân tích chiến lược kinh doanh BI cho Ban Giám Đốc
   */
  async getBusinessInsights(): Promise<ApiResponse<AiBusinessAdvisorResponse>> {
    return apiClient.get<ApiResponse<AiBusinessAdvisorResponse>>(
      '/admin/ai/business-insights',
      { suppressErrorToast: true, showSuccessToast: false }
    );
  },
};
