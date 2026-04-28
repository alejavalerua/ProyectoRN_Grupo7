export interface INotificationRemoteSource {
  getUserNotifications(userId: string): Promise<any[]>;
  markAsRead(notificationId: string): Promise<void>;
}