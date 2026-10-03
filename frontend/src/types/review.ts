export interface Review {
  id: number;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  imageUrls: string[];
  adminReply?: string;
  repliedByName?: string;
  repliedAt?: string;
  createdAt: string;
  verifiedPurchase: boolean;
}

export interface ProductReviewSummary {
  averageRating: number;
  totalReviews: number;
  fiveStarCount: number;
  fourStarCount: number;
  threeStarCount: number;
  twoStarCount: number;
  oneStarCount: number;
}

export interface CreateReviewRequest {
  productId: number;
  orderItemId: number;
  rating: number;
  comment: string;
  imageUrls?: string[];
}

export interface AdminReviewDetail {
  id: number;
  userId?: number;
  userName: string;
  userEmail?: string;
  productId?: number;
  productName?: string;
  productImage?: string;
  orderItemId?: number;
  rating: number;
  comment: string;
  imageUrls: string[];
  adminReply?: string;
  repliedByName?: string;
  repliedAt?: string;
  status: 'approved' | 'hidden' | string;
  createdAt: string;
}

export interface AdminReviewFilterRequest {
  rating?: number;
  status?: string;
  keyword?: string;
  page?: number;
  size?: number;
}
