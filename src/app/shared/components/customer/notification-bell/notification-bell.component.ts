import {
  Component,
  ElementRef,
  HostListener,
  Input,
  signal,
  computed,
  inject,
  OnInit,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../../../core/customer/services/notification.service';
import { NotificationItemRaw, NotificationUI } from '../../../../core/customer/models/notification.model';
import { NotificationPopupComponent } from '../notification-popup/notification-popup.component';

function mapNotificationToUI(item: NotificationItemRaw): NotificationUI {
  let icon: string | null = null;
  if (item.notification_type === 'appointment') {
    icon = '/public/assets/customer/images/notifications/icon-calendar.svg';
  } else if (item.notification_type === 'system') {
    icon = '/public/assets/customer/images/notifications/icon-note.svg';
  }

  const parts = typeof item.message_parts === 'string'
    ? JSON.parse(item.message_parts)
    : item.message_parts || [{ text: item.content || item.title || '' }];

  return {
    id: item.notification_id,
    type: item.notification_type,
    unread: !item.is_read,
    avatar: item.pet?.profile_image_url || null,
    avatarAlt: item.pet?.pet_name || '',
    icon,
    iconAlt: 'Icon',
    relativeTime: item.created_at ? 'VỪA XONG' : '',
    dateTime: item.created_at ? new Date(item.created_at).toLocaleTimeString('vi-VN') : '',
    searchableText: item.searchable_text || '',
    messageParts: parts,
  };
}

@Component({
  selector: 'app-notification-bell',
  standalone: true,
  imports: [CommonModule, NotificationPopupComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './notification-bell.component.html',
  styleUrls: ['./notification-bell.component.scss'],
})
export class NotificationBellComponent implements OnInit {
  private readonly elementRef = inject(ElementRef);
  private readonly notificationService = inject(NotificationService);

  @Input() className = 'hidden sm:inline-flex';
  @Input() buttonClassName = 'p-1';
  @Input() iconClassName = 'h-[36px] w-[32px]';
  @Input() badgeClassName = '';

  readonly notificationIcon = '/public/assets/customer/images/navbar/notification.svg';

  readonly isOpen = signal<boolean>(false);
  readonly activeFilter = signal<string>('all');
  readonly searchValue = signal<string>('');

  readonly notifications = this.notificationService.notifications;

   readonly filteredItems = computed<NotificationUI[]>(() => {
    return (this.notifications() || []).map((item) => this.mapNotificationToUI(item));
  });

  readonly unreadCount = computed<number>(() => {
    return (this.notifications() || []).filter((item: any) => !item.read).length;
  });

  ngOnInit(): void {
    this.notificationService.fetchNotifications(
      this.activeFilter(),
      this.searchValue()
    );
  }

  toggleOpen(): void {
    this.isOpen.update((v) => !v);
  }

  close(): void {
    this.isOpen.set(false);
  }

  onFilterChange(filterId: string): void {
    this.activeFilter.set(filterId);
    this.notificationService.fetchNotifications(filterId, this.searchValue());
  }

  onSearchChange(query: string): void {
    this.searchValue.set(query);
    this.notificationService.fetchNotifications(this.activeFilter(), query);
  }

  onRead(id: string): void {
    this.notificationService.markAsRead(id);
  }

  onReadAll(): void {
    this.notificationService.markAllAsRead();
  }

  @HostListener('document:pointerdown', ['$event'])
  onDocumentClick(event: PointerEvent): void {
    if (
      this.isOpen() &&
      !this.elementRef.nativeElement.contains(event.target)
    ) {
      this.close();
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.isOpen()) {
      this.close();
    }
  }

   private mapNotificationToUI(item: any): NotificationUI {
    let icon: string | null = null;
    if (item.type === 'appointment') {
      icon = '/public/assets/customer/images/notifications/icon-calendar.svg';
    } else if (item.type === 'system') {
      icon = '/public/assets/customer/images/notifications/icon-note.svg';
    }

    // Bóc tách message_parts từ object rawItem gốc được đính kèm ở service (nếu có)
    const rawData = item.rawItem || {};
    const parts = typeof rawData.message_parts === 'string'
      ? JSON.parse(rawData.message_parts)
      : rawData.message_parts || [{ text: item.content || item.title || '' }];

    return {
      id: item.id,                        // Đổi từ item.notification_id thành item.id
      type: item.type,                    // Đổi từ item.notification_type thành item.type
      unread: !item.read,                 // Đổi từ !item.is_read thành !item.read
      avatar: rawData.pet?.profile_image_url || null,
      avatarAlt: item.petName || '',      // Sử dụng thuộc tính petName đã map sẵn từ service
      icon,
      iconAlt: 'Icon',
      relativeTime: item.createdAt ? 'VỪA XONG' : '', // Đổi sang item.createdAt
      dateTime: item.createdAt ? new Date(item.createdAt).toLocaleTimeString('vi-VN') : '',
      searchableText: item.searchableText || '',       // Đổi sang item.searchableText
      messageParts: parts,
    };
  }
}