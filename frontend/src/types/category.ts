export interface CategoryResponse {
  id: number;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parentId?: number | null;
  parentName?: string | null;
  level?: number;
  children: CategoryResponse[];
}

export interface CreateCategoryRequest {
  name: string;
  slug?: string;
  description?: string;
  image?: string;
  parentId?: number | null;
}

export interface UpdateCategoryRequest {
  name: string;
  slug?: string;
  description?: string;
  image?: string;
  parentId?: number | null;
}

export interface CategoryFilterParams {
  keyword?: string;
  parentId?: number | null;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: string;
}

export interface PaginatedCategoriesResponse {
  content: CategoryResponse[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}
