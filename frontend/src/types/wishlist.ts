export interface WishlistResponse {
  id: number;
  productId: number;
  name: string;
  slug: string;
  mainImage: string;
  price: number;
  salePrice?: number;
  unit?: string;
  inStock: boolean;
  primaryCategoryName?: string;
  addedAt: string;
}

export interface WishlistStatusResponse {
  productId: number;
  isFavorite: boolean;
  wishlistCount: number;
  message: string;
}
