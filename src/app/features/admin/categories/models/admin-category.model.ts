export type CategoryStatus = 'ACTIVE' | 'INACTIVE';

export interface AdminCategory {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  status: CategoryStatus;
}

export interface CategoryPageResponse {
  items: AdminCategory[];
  nextCursor: string | null;
}

export interface SaveCategoryRequest {
  name: string;
  slug?: string;
  // OpenAPI v7 CategoryWrite.parentId is an ObjectId only, not nullable.
  // Omit this field entirely for root categories.
  parentId?: string;
  status: CategoryStatus;
}
