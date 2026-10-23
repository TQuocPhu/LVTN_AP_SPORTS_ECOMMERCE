export type SupportConversationStatus = 'WAITING' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
export type SupportSenderRole = 'CUSTOMER' | 'STAFF' | 'SYSTEM';
export type SupportReportStatus = 'PENDING' | 'PROCESSED' | 'REJECTED';

export interface SupportUserSummary {
  id: number;
  name: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  role?: string;
}

export interface SupportConversation {
  id: number;
  customerId: number;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  customerAvatar?: string;
  staffId?: number;
  staffName?: string;
  staffAvatar?: string;
  orderId?: number;
  orderCode?: string;
  subject: string;
  status: SupportConversationStatus;
  createdAt: string;
  lastMessageAt: string;
  acceptedAt?: string;
  closedAt?: string;
  rating?: number;
  feedbackNote?: string;
  unreadCount?: number;
}

export interface SupportMessage {
  id: number;
  conversationId: number;
  senderId?: number;
  senderName: string;
  senderRole: SupportSenderRole;
  senderAvatar?: string;
  content?: string;
  attachmentUrl?: string;
  isViolation?: boolean;
  violationReason?: string;
  maskedContent?: string;
  originalContent?: string;
  conversationStatus?: SupportConversationStatus;
  createdAt: string;
}

export interface SupportReport {
  id: number;
  conversationId: number;
  reportedCustomerId: number;
  reportedCustomerName: string;
  reportedCustomerEmail: string;
  reportedByStaffId: number;
  reportedByStaffName: string;
  reason: string;
  evidenceImageUrls: string[];
  status: SupportReportStatus;
  createdAt: string;
}

export interface CreateConversationRequest {
  subject?: string;
  orderId?: number;
}

export interface SendSupportMessageRequest {
  content?: string;
  attachmentUrl?: string;
}

export interface RateConversationRequest {
  rating: number;
  feedbackNote?: string;
}

export interface CreateSupportReportRequest {
  reason: string;
  evidenceImageUrls?: string[];
}
