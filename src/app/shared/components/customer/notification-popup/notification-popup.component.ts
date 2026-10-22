import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  NotificationUI,
  NotificationFilter,
  NOTIFICATION_FILTERS,
} from '../../../../core/customer/models/notification.model';

@Component({
  selector: 'app-notification-visual',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (item.avatar) {
      <span class="notification-item__visual notification-item__visual--pet">
        <img [src]="item.avatar" [alt]="item.avatarAlt" class="notification-item__avatar" />
      </span>
    } @else {
      <span
        class="notification-item__visual"
        [class.notification-item__visual--system]="item.type === 'system'"
        [class.notification-item__visual--appointment]="item.type === 'appointment'"
      >
        <img
          [src]="item.icon || '/public/assets/customer/images/notifications/icon-note.svg'"
          [alt]="item.iconAlt"
          [class.notification-item__icon--system]="item.type === 'system'"
          [class.notification-item__icon--appointment]="item.type === 'appointment'"
        />
      </span>
    }
  `,
})
export class NotificationVisualComponent {
  @Input({ required: true }) item!: NotificationUI;
}

@Component({
  selector: 'app-notification-item',
  standalone: true,
  imports: [CommonModule, NotificationVisualComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button
      type="button"
      class="notification-item"
      [class.notification-item--unread]="item.unread"
      [class.notification-item--appointment]="item.type === 'appointment'"
      [class.notification-item--system]="item.type === 'system'"
      (click)="read.emit(item.id)"
      [attr.aria-label]="'Thông báo: ' + item.searchableText"
    >
      <app-notification-visual [item]="item" />
      <span class="notification-item__content">
        <p class="notification-item__message">
          @for (part of item.messageParts; track $index) {
            <span
              [class.notification-item__message-strong]="part.tone === 'strong'"
              [class.notification-item__message-strong-dark]="part.tone === 'strongDark'"
              [class.notification-item__message-brand]="part.tone === 'brandStrong'"
            >
              {{ part.text }}
            </span>
          }
        </p>
        <span class="notification-item__meta">
          <span>{{ item.relativeTime }}</span>
          @if (item.dateTime) {
            <span>{{ item.dateTime }}</span>
          }
        </span>
      </span>
    </button>
  `,
})
export class NotificationItemComponent {
  @Input({ required: true }) item!: NotificationUI;
  @Output() read = new EventEmitter<string>();
}

@Component({
  selector: 'app-notification-popup',
  standalone: true,
  imports: [CommonModule, FormsModule, NotificationItemComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './notification-popup.component.html',
  styleUrls: ['./notification-popup.component.scss'],
})
export class NotificationPopupComponent {
  @Input({ required: true }) filteredItems: NotificationUI[] = [];
  @Input({ required: true }) unreadCount = 0;
  @Input() activeFilter = 'all';
  @Input() searchValue = '';

  @Output() close = new EventEmitter<void>();
  @Output() filterChange = new EventEmitter<string>();
  @Output() searchChange = new EventEmitter<string>();
  @Output() read = new EventEmitter<string>();
  @Output() readAll = new EventEmitter<void>();

  readonly filters: NotificationFilter[] = NOTIFICATION_FILTERS;
  readonly iconSearchPaw = '/public/assets/customer/images/notifications/icon-search-paw.svg';
  readonly iconClose = '/public/assets/customer/images/notifications/icon-close.svg';
}