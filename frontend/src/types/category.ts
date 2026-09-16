export interface CategoryResponse {
  id: number;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parentId?: number | null;
  parentName?: string | null;
  children: CategoryResponse[];
}
