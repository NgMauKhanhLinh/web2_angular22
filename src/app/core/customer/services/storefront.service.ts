import { HttpParams } from '@angular/common/http';
import { Injectable, signal, inject } from '@angular/core';
import { Observable, finalize } from 'rxjs';
import { Product } from '../models/product.model';
import { ApiClientService } from '../../services/api-client.service';

export interface ProductReview {
  id: string;
  authorName: string;
  rating: number;
  content: string;
  createdAt: string;
}

export interface AdoptionPet {
  id: string;
  name: string;
  description: string;
  status: string;
  need: string;
  state: 'waiting' | 'adopted';
  image: string;
}

export interface AdoptionPartner {
  id: string;
  name: string;
  href: string;
  region: string;
  address: string;
  description: string;
  image: string;
}

export interface AdoptionRequest {
  id: string;
  petId: string;
  petName: string;
  petImage: string;
  status: string;
  statusLabel: string;
  submittedAt: string;
  reason?: string;
}

export interface SearchResult {
  query: string;
  total: number;
  results: {
    services: Record<string, unknown>[];
    products: Product[];
    articles: Record<string, unknown>[];
  };
}

@Injectable({
  providedIn: 'root',
})
export class StorefrontService {
  private readonly apiClient = inject(ApiClientService);

  readonly productsLoading = signal<boolean>(false);
  readonly searchLoading = signal<boolean>(false);

  /**
   * Lấy danh sách sản phẩm cửa hàng
   */
  getProducts(category?: string): Observable<Product[]> {
    this.productsLoading.set(true);

    let params = new HttpParams();
    if (category && category !== 'all') {
      params = params.set('category', category);
    }

    return this.apiClient.get<Product[]>('/products', { params }).pipe(
      finalize(() => this.productsLoading.set(false))
    );
  }

  /**
   * Lấy chi tiết 1 sản phẩm theo ID
   */
  getProduct(productId: string): Observable<Product> {
    return this.apiClient.get<Product>(`/products/${productId}`);
  }

  /**
   * Lấy danh sách đánh giá của sản phẩm
   */
  getProductReviews(productId: string): Observable<ProductReview[]> {
    return this.apiClient.get<ProductReview[]>(`/products/${productId}/reviews`);
  }

  /**
   * Tạo đánh giá mới cho sản phẩm
   */
  createProductReview(productId: string, rating: number, content: string): Observable<unknown> {
    return this.apiClient.post(`/products/${productId}/reviews`, { rating, content });
  }

  /**
   * Yêu thích/Thích một đánh giá sản phẩm
   */
  likeProductReview(reviewId: string): Observable<unknown> {
    return this.apiClient.post(`/reviews/${reviewId}/like`, {});
  }

  /**
   * Tìm kiếm tổng hợp (Sản phẩm, Dịch vụ, Bài viết)
   */
  search(query: string, type = 'all', sort = 'relevant'): Observable<SearchResult> {
    this.searchLoading.set(true);

    let params = new HttpParams()
      .set('q', query)
      .set('type', type)
      .set('sort', sort);

    return this.apiClient.get<SearchResult>('/search', { params }).pipe(
      finalize(() => this.searchLoading.set(false))
    );
  }

  /**
   * Danh sách thú cưng cứu trợ
   */
  getAdoptionPets(): Observable<AdoptionPet[]> {
    return this.apiClient.get<AdoptionPet[]>('/adoption/pets');
  }

  /**
   * Danh sách đối tác cứu trợ
   */
  getRescuePartners(): Observable<AdoptionPartner[]> {
    return this.apiClient.get<AdoptionPartner[]>('/adoption/partners');
  }

  /**
   * Gửi đơn yêu cầu nhận nuôi
   */
  createAdoptionRequest(petId: string, formValues: Record<string, string>): Observable<unknown> {
    return this.apiClient.post(`/adoption/pets/${petId}/request`, formValues);
  }

  /**
   * Lịch sử gửi đơn nhận nuôi của người dùng hiện tại
   */
  getMyAdoptionRequests(): Observable<AdoptionRequest[]> {
    return this.apiClient.get<AdoptionRequest[]>('/my-adoption-requests');
  }
}