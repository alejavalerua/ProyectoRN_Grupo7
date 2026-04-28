import { AppNotification } from '../entities/AppNotification';

export interface INotificationRepository {
  getUserNotifications(userId: string): Promise<AppNotification[]>;
  markAsRead(notificationId: string): Promise<void>;
}