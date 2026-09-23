import { CategoryResponse } from './category';

export interface ProductVariant {
  id?: number;
  sku: string;
  size?: string | null;
  color?: string | null;
  attributes?: string | null;
  variantName?: string | null;
  price: number;
  costPrice: number;
  stockQuantity: number;
  images: string[];
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  price: number;
  originalPrice?: number;
  rating?: number;
  reviewsCount?: number;
  totalStock: number;
  stock?: number;
  status: 'in_stock' | 'out_of_stock' | 'discontinued' | string;
  unit: string;
  weight?: number; // Trọng lượng tính bằng grams
  mainImage?: string;
  primaryCategoryId?: number;
  primaryCategoryName?: string;
  categories: CategoryResponse[];
  variantCount: number;
  variants?: ProductVariant[];
  createdAt: string;
  updatedAt: string;
}

export interface ProductDetail extends Product {
  description?: string;
  weight?: number; // Kế thừa từ Product, nhưng đảm bảo trường chi tiết có weight
  specifications: Record<string, string>;
  variants: ProductVariant[];
  allImages: string[];
}

export interface CreateProductFormRequest {
  name: string;
  slug?: string;
  categoryIds: number[];
  primaryCategoryId?: number;
  description?: string;
  price: number;
  unit: string;
  weight?: number; // Tính bằng grams, mặc định 500g nếu không nhập
  mainImage?: string;
  specifications: Record<string, string>;
  variants: ProductVariant[];
}

export interface UpdateProductFormRequest {
  name: string;
  slug: string;
  categoryIds: number[];
  primaryCategoryId?: number;
  description?: string;
  price: number;
  unit: string;
  weight?: number; // Tính bằng grams
  status: string;
  mainImage?: string;
  specifications: Record<string, string>;
  variants: ProductVariant[];
}

export interface ProductFilterParams {
  keyword?: string;
  categoryId?: number;
  status?: string;
  unit?: string;
  variantSize?: string;
  rating?: number;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: 'ASC' | 'DESC' | string;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}
