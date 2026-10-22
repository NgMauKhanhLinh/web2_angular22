import { Injectable, signal, inject } from '@angular/core';
import { Observable, finalize, map } from 'rxjs';

import { AuthService } from './auth.service';
import { HttpClient } from '@angular/common/http';
import {
  CheckoutAuthPayload,
  CheckoutGuestPayload,
  OrderRecord,
  OrderItem,
} from '../models/order.model';
import { ApiClientService } from '../../services/api-client.service';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  private readonly apiClient = inject(ApiClientService);
  private readonly authService = inject(AuthService);
  private readonly http = inject(HttpClient); // Dùng HttpClient thuần chỉ để đọc static asset JSON

  readonly ordersLoading = signal<boolean>(false);
  readonly checkoutLoading = signal<boolean>(false);

  /**
   * Áp dụng mã giảm giá (Voucher)
   */
  applyVoucher(code: string, cartTotal: number): Observable<number> {
    return this.apiClient
      .post<{ discountAmount: number }, { code: string; total: number }>(
        '/vouchers/apply',
        { code, total: cartTotal }
      )
      .pipe(map((res) => res.discountAmount || 0));
  }

  /**
   * Thanh toán dành cho Khách vãng lai (Chưa đăng nhập)
   */
  checkoutGuest(payload: CheckoutGuestPayload): Observable<unknown> {
    this.checkoutLoading.set(true);

    const body = {
      full_name: payload.guest.fullName,
      phone: payload.guest.phone,
      email: payload.guest.email,
      address_line: payload.guest.address,
      ward: payload.guest.ward || undefined,
      district: payload.guest.district,
      province: payload.guest.city,
      payment_method: payload.paymentMethod,
      voucher_code: payload.voucherCode || undefined,
      note: payload.note || undefined,
      items: payload.items.map((item) => ({
        product_id: item.id,
        variant_id: null,
        quantity: item.quantity,
      })),
    };

    return this.apiClient.post('/orders/guest-checkout', body).pipe(
      finalize(() => this.checkoutLoading.set(false))
    );
  }

  /**
   * Thanh toán dành cho User đã đăng nhập
   */
  checkoutAuthenticated(payload: CheckoutAuthPayload): Observable<unknown> {
    this.checkoutLoading.set(true);

    const body = {
      address_id: payload.addressId,
      payment_method: payload.paymentMethod,
      voucher_code: payload.voucherCode || undefined,
      note: payload.note || undefined,
      items: payload.items.map((item) => ({
        product_id: item.id,
        variant_id: null,
        quantity: item.quantity,
      })),
    };

    return this.apiClient.post('/orders/checkout', body).pipe(
      finalize(() => this.checkoutLoading.set(false))
    );
  }

  /**
   * Lấy danh sách Đơn hàng của tôi
   */
  getMyOrders(): Observable<OrderRecord[]> {
    this.ordersLoading.set(true);

    // Nếu chưa đăng nhập, fallback đọc dữ liệu mẫu từ /datasets/orderData.json
    if (!this.authService.isAuthenticated()) {
      return this.http.get<unknown>('/datasets/orderData.json').pipe(
        map((res) => this.normalizeMockOrders(res)),
        finalize(() => this.ordersLoading.set(false))
      );
    }

    return this.apiClient.get<unknown>('/orders').pipe(
      map((res) => this.normalizeBackendOrders(res)),
      finalize(() => this.ordersLoading.set(false))
    );
  }

  /**
   * Xem chi tiết 1 Đơn hàng
   */
  getOrder(orderId: string): Observable<OrderRecord> {
    return this.apiClient.get<unknown>(`/orders/${orderId}`).pipe(
      map((res) => this.normalizeSingleOrder(res))
    );
  }

  // --- HÀM TUỐT / CHUẨN HÓA DỮ LIỆU ---

  private normalizeBackendOrders(response: unknown): OrderRecord[] {
    const rawData = response && typeof response === 'object' ? (response as Record<string, unknown>) : {};
    const ordersList = Array.isArray(rawData['orders']) ? rawData['orders'] : Array.isArray(response) ? response : [];

    return ordersList.map((item) => this.normalizeSingleOrder(item));
  }

  private normalizeSingleOrder(item: unknown): OrderRecord {
    const order = item && typeof item === 'object' ? (item as Record<string, unknown>) : {};
    const rawStatus = String(order['order_status'] ?? order['status'] ?? 'pending');

    const statusMap: Record<string, string> = {
      pending: 'Chờ xử lý',
      processing: 'Đang chuẩn bị hàng',
      shipping: 'Đang giao',
      delivered: 'Đã giao',
      cancelled: 'Đã hủy',
    };

    const recipient = order['recipient'] && typeof order['recipient'] === 'object'
      ? (order['recipient'] as Record<string, unknown>)
      : {};

    const rawItems = Array.isArray(order['items']) ? order['items'] : Array.isArray(order['products']) ? order['products'] : [];

    return {
      id: String(order['order_id'] ?? order['id'] ?? ''),
      code: String(order['order_code'] ?? order['code'] ?? `ORD-${order['order_id']}`),
      total: Number(order['total_amount'] ?? order['total'] ?? 0),
      statusLabel: statusMap[rawStatus] ?? rawStatus,
      paymentMethod: String(order['payment_method'] ?? order['paymentMethod'] ?? 'COD'),
      shippingAddress: String(recipient['address'] ?? order['shipping_address'] ?? ''),
      recipientName: String(recipient['name'] ?? order['recipient_name'] ?? ''),
      recipientPhone: String(recipient['phone'] ?? order['recipient_phone'] ?? ''),
      createdAt: String(order['created_at'] ?? order['orderedAt'] ?? ''),
      items: rawItems.map((p: Record<string, unknown>) => ({
        id: String(p['product_id'] ?? p['id'] ?? ''),
        name: String(p['product_name'] ?? p['name'] ?? 'Sản phẩm'),
        price: Number(p['unit_price'] ?? p['price'] ?? 0),
        quantity: Number(p['quantity'] ?? 1),
        image: String(p['image_url'] ?? p['image'] ?? ''),
      })),
    };
  }

  private normalizeMockOrders(response: unknown): OrderRecord[] {
    const data = response && typeof response === 'object' ? (response as Record<string, unknown>) : {};
    const items = Array.isArray(data['ORDERS']) ? data['ORDERS'] : [];

    return items.map((item: Record<string, unknown>) => {
      const recipient = item['recipient'] && typeof item['recipient'] === 'object'
        ? (item['recipient'] as Record<string, unknown>)
        : {};

      const products = Array.isArray(item['products']) ? item['products'] : [];
      const productsTotal = products.reduce(
        (sum: number, p: Record<string, unknown>) => sum + Number(p['price'] || 0) * Number(p['quantity'] || 1),
        0
      );
      const shippingFee = Number(item['shippingFee'] || 0);
      const discount = Number(item['discount'] || 0);

      return {
        id: String(item['id'] ?? ''),
        code: String(item['code'] ?? item['id'] ?? ''),
        total: productsTotal + shippingFee - discount,
        statusLabel: item['status'] === 'delivered' ? 'Đã giao' : 'Đang xử lý',
        paymentMethod: String(item['paymentMethod'] ?? ''),
        shippingAddress: String(recipient['address'] ?? ''),
        recipientName: String(recipient['name'] ?? ''),
        recipientPhone: String(recipient['phone'] ?? ''),
        createdAt: String(item['orderedAt'] ?? ''),
        items: products.map((p: Record<string, unknown>) => ({
          id: String(p['id'] ?? ''),
          name: String(p['name'] ?? ''),
          price: Number(p['price'] ?? 0),
          quantity: Number(p['quantity'] ?? 1),
          image: String(p['image'] ?? ''),
        })),
      };
    });
  }
}