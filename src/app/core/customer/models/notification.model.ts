export interface UserNotification {
  id: string;
  type: string;
  content: string;
  title: string;
  searchableText: string;
  createdAt: string;
  read: boolean;
  petName: string;
  icon: string;
}


export type NotificationType = 'appointment' | 'system' | 'pet';

export type NotificationTone = 'strong' | 'strongDark' | 'brandStrong';

export interface MessagePart {
  text: string;
  tone?: NotificationTone;
}

export interface NotificationItemRaw {
  notification_id: string;
  notification_type: NotificationType;
  is_read: boolean;
  pet?: {
    profile_image_url?: string;
    pet_name?: string;
  };
  created_at?: string;
  searchable_text?: string;
  message_parts?: string | MessagePart[];
  content?: string;
  title?: string;
}

export interface NotificationUI {
  id: string;
  type: NotificationType;
  unread: boolean;
  avatar: string | null;
  avatarAlt: string;
  icon: string | null;
  iconAlt: string;
  relativeTime: string;
  dateTime: string;
  searchableText: string;
  messageParts: MessagePart[];
}

export interface NotificationFilter {
  id: string;
  label: string;
}

export const NOTIFICATION_FILTERS: NotificationFilter[] = [
  { id: 'all', label: 'Tất cả' },
  { id: 'unread', label: 'Chưa đọc' },
  { id: 'appointment', label: 'Lịch hẹn' },
  { id: 'system', label: 'Hệ thống' },
];