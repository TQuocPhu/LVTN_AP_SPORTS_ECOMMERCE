import { apiClient } from './apiClient';
import { ApiResponse } from '../types';

export interface SuggestedProductMobile {
  name: string;
  slug: string;
  price: string;
  link: string;
}

export interface AiSportsAdvisorResponseMobile {
  reply: string;
  suggestedProducts: SuggestedProductMobile[];
}

export interface ChatMessageMobile {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
}

/**
 * Service giao tiếp với API Trợ lý AI Sports Advisor trên Mobile App
 */
export const aiService = {
  /**
   * Gửi câu hỏi tư vấn kích thước và trang bị thể thao tới Gemini AI
   */
  async askAdvisor(
    question: string,
    activeProductSlug?: string,
    guestToken?: string
  ): Promise<AiSportsAdvisorResponseMobile> {
    const res = await apiClient.post<ApiResponse<AiSportsAdvisorResponseMobile>>(
      '/customer/ai/advisor',
      {
        question,
        activeProductSlug,
        guestToken,
      }
    );
    return res.data.data;
  },

  /**
   * Lấy lịch sử hội thoại tư vấn
   */
  async getChatHistory(guestToken?: string): Promise<ChatMessageMobile[]> {
    const res = await apiClient.get<ApiResponse<any[]>>('/customer/ai/advisor/history', {
      params: guestToken ? { guestToken } : {},
    });
    const list = res.data.data || [];
    return list.map((item) => ({
      id: String(item.id),
      sender: item.sender === 'user' ? 'user' : 'bot',
      text: item.message,
      timestamp: item.createdAt,
    }));
  },
};
