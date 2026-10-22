import { HttpParams } from '@angular/common/http';
import { Injectable, signal, inject } from '@angular/core';
import { Observable, finalize } from 'rxjs';
import { ApiClientService } from '../../services/api-client.service';

export interface BookingServiceOption {
  id: string;
  name: string;
  description: string;
  price: number;
  type: 'clinic' | 'grooming';
}

export interface PetSpecies {
  id: string;
  name: string;
}

export interface AppointmentSlot {
  id: string;
  label: string;
  available: boolean;
  doctorName?: string;
}

export interface BookAppointmentPayload {
  slotId: string;
  services: { serviceId: string; quantity: number }[];
  petName: string;
  speciesId: string;
  customerName: string;
  customerPhone: string;
  notes?: string;
  paymentMethod: 'store' | 'online';
}

export interface AppointmentHistoryItem {
  id: string;
  code: string;
  petName: string;
  serviceId?: string;
  serviceName: string;
  serviceType: 'clinic' | 'grooming';
  rawDate: string;
  date: string;
  startTime: string;
  endTime?: string;
  price: number;
  status: 'pending_payment' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
  statusLabel: string;
  paymentMethod?: string;
  paymentStatus?: string;
  canCancel: boolean;
  canReschedule: boolean;
  canRebook: boolean;
  canReview: boolean;
  reviewed?: boolean;
  services: { id: string; serviceId: string; name: string; serviceTypeId: string; quantity: number }[];
}

@Injectable({
  providedIn: 'root',
})
export class BookingService {
  private readonly apiClient = inject(ApiClientService);

  readonly servicesLoading = signal<boolean>(false);
  readonly slotsLoading = signal<boolean>(false);
  readonly appointmentsLoading = signal<boolean>(false);

  /**
   * Lấy danh sách dịch vụ (Khám bệnh & Grooming)
   */
  getServices(): Observable<BookingServiceOption[]> {
    this.servicesLoading.set(true);
    return this.apiClient.get<BookingServiceOption[]>('/booking/services').pipe(
      finalize(() => this.servicesLoading.set(false))
    );
  }

  /**
   * Lấy danh sách loài thú cưng (Chó, Mèo,...)
   */
  getPetSpecies(): Observable<PetSpecies[]> {
    return this.apiClient.get<PetSpecies[]>('/pet-species');
  }

  /**
   * Lấy danh sách khung giờ còn trống theo Ngày, Chi nhánh và Loại dịch vụ
   */
  getAppointmentSlots(date: string, branchId: string, serviceType: 'clinic' | 'grooming'): Observable<AppointmentSlot[]> {
    this.slotsLoading.set(true);

    let params = new HttpParams();
    if (date) params = params.set('date', date);
    if (branchId) params = params.set('branchId', branchId);
    if (serviceType) params = params.set('serviceType', serviceType);

    return this.apiClient.get<AppointmentSlot[]>('/booking/slots', { params }).pipe(
      finalize(() => this.slotsLoading.set(false))
    );
  }

  /**
   * Đặt lịch mới
   */
  bookAppointment(payload: BookAppointmentPayload): Observable<unknown> {
    return this.apiClient.post('/booking/appointments', payload);
  }

  /**
   * Lấy lịch sử đặt lịch của người dùng hiện tại
   */
  getAppointmentHistory(): Observable<AppointmentHistoryItem[]> {
    this.appointmentsLoading.set(true);
    return this.apiClient.get<AppointmentHistoryItem[]>('/my-appointments').pipe(
      finalize(() => this.appointmentsLoading.set(false))
    );
  }

  /**
   * Hủy lịch hẹn
   */
  cancelAppointment(appointmentId: string): Observable<unknown> {
    return this.apiClient.post(`/appointments/${appointmentId}/cancel`, {});
  }

  /**
   * Xác nhận thanh toán lịch hẹn tại phòng khám
   */
  checkoutAppointment(appointmentId: string, paymentMethod: 'store' | 'online'): Observable<unknown> {
    return this.apiClient.post(`/appointments/${appointmentId}/checkout`, { paymentMethod });
  }

  /**
   * Đánh giá chất lượng dịch vụ sau khi hoàn thành khám/grooming
   */
  createServiceReview(serviceId: string, rating: number, comment: string): Observable<unknown> {
    return this.apiClient.post(`/services/${serviceId}/reviews`, { rating, comment });
  }
}