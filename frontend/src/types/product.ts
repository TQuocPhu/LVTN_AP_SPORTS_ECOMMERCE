import { CategoryResponse } from './category';

export interface ProductVariant {
  id?: number;
  sku: string;
  size: string;
  color?: string;
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
  status: 'in_stock' | 'out_of_stock' | 'discontinued' | string;
  unit: string;
  mainImage?: string;
  primaryCategoryId?: number;
  primaryCategoryName?: string;
  categories: CategoryResponse[];
  variantCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProductDetail extends Product {
  description?: string;
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
