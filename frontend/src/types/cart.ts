export interface CartItem {
  id: number;
  productId: number;
  productName: string;
  productSlug: string;
  mainImage: string | null;
  variantId: number | null;
  sku: string | null;
  size: string | null;
  color: string | null;
  variantName?: string | null;
  price: number;
  stockQuantity: number;
  quantity: number;
  subtotal: number;
  inStock: boolean;
}

export interface CartSummary {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
}

export interface AddToCartPayload {
  productId: number;
  variantId?: number | null;
  quantity: number;
}

export interface UpdateCartItemPayload {
  quantity: number;
}
