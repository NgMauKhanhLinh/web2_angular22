import { HttpHeaders, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiClientService } from '../../../../core/services/api-client.service';
import {
  AdminCategory,
  CategoryPageResponse,
  CategoryStatus,
  SaveCategoryRequest,
} from '../models/admin-category.model';

export interface CategoryQuery {
  q?: string;
  status?: CategoryStatus;
  limit?: number;
  cursor?: string | null;
}

@Injectable({ providedIn: 'root' })
export class AdminCategoryService {
  private readonly api = inject(ApiClientService);

  listCategories(query: CategoryQuery = {}): Observable<CategoryPageResponse> {
    let params = new HttpParams().set('limit', String(query.limit ?? 20));
    if (query.q?.trim()) params = params.set('q', query.q.trim());
    if (query.status) params = params.set('status', query.status);
    if (query.cursor) params = params.set('cursor', query.cursor);
    return this.api.get<CategoryPageResponse>('/categories', { params });
  }

  createCategory(body: SaveCategoryRequest): Observable<AdminCategory> {
    // Backend uses the idempotency key to prevent duplicate submissions.
    const headers = new HttpHeaders({ 'Idempotency-Key': crypto.randomUUID() });
    return this.api.post<AdminCategory, SaveCategoryRequest>('/categories', body, { headers });
  }

  updateCategory(id: string, body: SaveCategoryRequest): Observable<AdminCategory> {
    const headers = new HttpHeaders({ 'Idempotency-Key': crypto.randomUUID() });
    return this.api.patch<AdminCategory, SaveCategoryRequest>(
      `/categories/${encodeURIComponent(id)}`,
      body,
      { headers },
    );
  }
}
