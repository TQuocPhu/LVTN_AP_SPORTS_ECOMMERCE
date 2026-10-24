export interface ApiResponse<T = any> {
  status: number;
  message: string;
  data: T;
  success: boolean;
  errors?: Record<string, string>;
}

export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  roleName: string;
  status: string;
  googleId?: string | null;
  googleAccount?: boolean;
  createdAt?: string;
}

export interface GoogleLoginPayload {
  idToken?: string;
  code?: string;
  redirectUri?: string;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface CustomerLoginResponse {
  user: User;
  tokens?: TokenResponse;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  imageUrl?: string;
  iconName?: string;
  description?: string;
  parentId?: number;
}

export interface Brand {
  id: number;
  name: string;
  slug: string;
  logoUrl?: string;
}

export interface ProductVariant {
  id: number;
  sku: string;
  barcode?: string;
  price: number;
  originalPrice?: number;
  stockQuantity: number;
  color?: string;
  size?: string;
  imageUrl?: string;
  attributes?: string;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  description?: string;
  basePrice: number;
  originalPrice?: number;
  thumbnail?: string;
  images?: string[];
  category?: Category;
  brand?: Brand;
  variants?: ProductVariant[];
  averageRating?: number;
  reviewsCount?: number;
  totalSold?: number;
  isFeatured?: boolean;
}

export interface CartItem {
  id: string; // unique item key: `${productId}-${variantId}`
  productId: number;
  productName: string;
  productSlug: string;
  productImage?: string;
  variantId?: number;
  variantSku?: string;
  variantColor?: string;
  variantSize?: string;
  price: number;
  quantity: number;
  stockQuantity: number;
}

export interface OrderItem {
  id: number;
  productId: number;
  productName: string;
  productSlug: string;
  image?: string;
  variantId?: number;
  sku?: string;
  barcode?: string;
  attributes?: string;
  price: number;
  quantity: number;
  isReviewed?: boolean;
}

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipping'
  | 'delivered'
  | 'completed'
  | 'cancelled';

export interface Order {
  id: number;
  orderCode: string;
  status: OrderStatus;
  paymentMethod: string;
  paymentStatus: string;
  totalAmount: number;
  shippingFee: number;
  discountAmount?: number;
  finalAmount: number;
  trackingCode?: string;
  customerName?: string;
  customerPhone?: string;
  shippingAddress?: string;
  note?: string;
  createdAt: string;
  updatedAt?: string;
  packVerified?: boolean;
  items?: OrderItem[];
}

export interface Review {
  id: number;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  imageUrls: string[];
  createdAt: string;
  verifiedPurchase: boolean;
  variantSummary?: string;
}

export interface ShippingAddress {
  id: number;
  fullName: string;
  phone: string;
  address: string;
  city: string;
  provinceId?: number;
  districtId?: number;
  wardCode?: string;
  isDefault: boolean;
}

export interface UserSession {
  id: number;
  deviceToken: string;
  deviceName?: string;
  osType?: string;
  lastIp?: string;
  createdAt?: string;
  lastActiveAt?: string;
  currentDevice?: boolean;
}


