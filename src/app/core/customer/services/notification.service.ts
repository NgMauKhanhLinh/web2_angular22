import { HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import { UserNotification } from '../models/notification.model';
import { ApiClientService } from '../../services/api-client.service';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly apiClient = inject(ApiClientService);

  getNotifications(status = 'all', search = ''): Observable<UserNotification[]> {
    let params = new HttpParams();
    if (status) params = params.set('status', status);
    if (search) params = params.set('search', search);

    return this.apiClient.get<Array<Record<string, unknown>>>('/notifications', { params }).pipe(
      map((items) =>
        items.map((item) => {
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
                  ? '/assets/images/notification/icon-calendar.svg'
                  : '/assets/images/notification/icon-note.svg')
            ),
          };
        })
      )
    );
  }

  markAsRead(notificationId: string): Observable<unknown> {
    return this.apiClient.patch(`/notifications/${encodeURIComponent(notificationId)}/read`, {});
  }

  markAllAsRead(): Observable<unknown> {
    return this.apiClient.patch('/notifications/read-all', {});
  }
}