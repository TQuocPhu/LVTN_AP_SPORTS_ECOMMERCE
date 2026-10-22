/**
 * Định nghĩa các kiểu dữ liệu TypeScript cho Hệ sinh thái 5 Tính năng AI Thông minh (Google Gemini Flash)
 * Đồng bộ chuẩn xác 100% với Backend Spring Boot DTOs
 */

// 1. Types cho Agent 1: AI Sports Advisor
export interface AiSportsAdvisorRequest {
  question: string;
  activeProductSlug?: string;
  guestToken?: string;
}

export interface SuggestedProduct {
  name: string;
  slug: string;
  price: string;
  link: string;
}

export interface AiSportsAdvisorResponse {
  reply: string;
  suggestedProducts: SuggestedProduct[];
}

export interface ChatMessageDto {
  id: number;
  sender: 'user' | 'bot' | 'staff';
  message: string;
  createdAt: string;
  suggestedProducts?: SuggestedProduct[];
}

// 2. Types cho Agent 2: AI Product Content Creator
export interface AiProductContentRequest {
  productName: string;
  categoryName?: string;
  brand?: string;
  attributes?: Record<string, string>;
  tone?: string;
}

export interface AiProductContentResponse {
  htmlContent: string;
  seoTitle: string;
  metaDescription: string;
}

// 3. Types cho Agent 3: AI Executive Business Advisor
export interface AiBusinessAdvisorResponse {
  executiveSummary: string;
  riskAlerts: string[];
  recommendations: string[];
  generatedAt: string;
}

// 4. Types cho Agent 4: AI Review Sentiment & Summary
export interface AiReviewSummaryResponse {
  productId: number;
  satisfactionRate: number;
  totalReviewsAnalyzed: number;
  positiveHighlights: string[];
  negativeNotes: string[];
  summaryText: string;
}

// 5. Types cho Agent 5: AI Support Chat Assistant
export interface AiChatSuggestRequest {
  recentMessages: string[];
  customerName?: string;
}

export interface AiChatSuggestResponse {
  suggestions: string[];
}
