/**
 * Canonical frontend response shapes.
 *
 * These interfaces are NOT claims about the backend wire format.
 * Domain services should map backend DTOs into these shapes only when useful.
 */

export interface FrontendApiResponse<TData, TMeta = unknown> {
  data: TData;
  message?: string;
  meta?: TMeta;
}

export interface PaginationMeta {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export interface PaginatedData<TItem> {
  items: readonly TItem[];
  pagination: PaginationMeta;
}

export interface ValidationIssue {
  field: string;
  message: string;
  code?: string;
}
