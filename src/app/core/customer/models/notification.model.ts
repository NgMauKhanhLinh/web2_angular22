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