import { HttpParams } from '@angular/common/http';
import { Injectable, signal, inject } from '@angular/core';
import { Observable, map, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { UserNotification, NotificationItemRaw } from '../models/notification.model';
import { ApiClientService } from '../../services/api-client.service';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly apiClient = inject(ApiClientService);

  readonly notifications = signal<UserNotification[]>([]);
  readonly loading = signal<boolean>(false);
  

  
  private mapRawToUserNotification(items: NotificationItemRaw[]): UserNotification[] {
    return items.map((item: any) => {
      const pet = item['pet'] && typeof item['pet'] === 'object' ? (item['pet'] as Record<string, unknown>) : {};
      return {
        id: String(item['notification_id'] ?? item['id'] ?? ''),
        type: String(item['notification_type'] ?? item['type'] ?? 'system'),
        content: String(item['content'] ?? ''),
        title: String(item['title'] ?? ''),
        searchableText: String(item['searchable_text'] ?? item['content'] ?? ''),
        createdAt: String(item['created_at'] ?? ''),
        read: Boolean(item['is_read'] ?? item['read']),
        petName: String(pet['pet_name'] ?? ''),
        icon: String(
          pet['profile_image_url'] ??
            (item['notification_type'] === 'appointment'
              ? '/public/assets/customer/images/notification/icon-calendar.svg'
              : '/public/assets/customer/images/notification/icon-note.svg')
        ),
      };
    });
  }

  
  getNotifications(status = 'all', search = ''): Observable<UserNotification[]> {
    let params = new HttpParams();
    if (status) params = params.set('status', status);
    if (search) params = params.set('search', search);

    return this.apiClient.get<NotificationItemRaw[]>('/notifications', { params }).pipe(
      map((items) => this.mapRawToUserNotification(items)),
      catchError(() => {
        // Dự phòng (Fallback) trả về dữ liệu mẫu khi backend lỗi
        return of(this.mapRawToUserNotification(this.getMockNotifications()));
      })
    );
  }

  
  fetchNotifications(filter = 'all', search = ''): void {
    this.loading.set(true);
    this.getNotifications(filter, search).subscribe({
      next: (data) => {
        this.notifications.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

 
  markAsRead(notificationId: string): void {
       this.notifications.update((list) =>
      list.map((item) => (item.id === notificationId ? { ...item, read: true } : item))
    );

   
    this.apiClient.patch(`/notifications/${encodeURIComponent(notificationId)}/read`, {}).subscribe();
  }

 
  markAllAsRead(): void {
    
    this.notifications.update((list) => 
      list.map((item) => ({ ...item, read: true }))
    );

    
    this.apiClient.patch('/notifications/read-all', {}).subscribe();
  }

  
  private getMockNotifications(): NotificationItemRaw[] {
    return [
      {
        notification_id: 'appointment-nau',
        notification_type: 'appointment',
        is_read: false,
        pet: { pet_name: 'Nâu', profile_image_url: '/public/assets/customer/images/pets/nau.jpg' },
        created_at: new Date().toISOString(),
        searchable_text: 'Lịch hẹn khám Nâu',
        content: 'Bạn có lịch hẹn khám sức khỏe cho bé Nâu vào lúc 14:00.',
      },
      {
        notification_id: 'system-1',
        notification_type: 'system',
        is_read: true,
        created_at: new Date(Date.now() - 3600000).toISOString(),
        searchable_text: 'Cập nhật hệ thống',
        content: 'Hệ thống Dr. Pets House đã cập nhật tính năng mới.',
      },
    ];
  }
}
