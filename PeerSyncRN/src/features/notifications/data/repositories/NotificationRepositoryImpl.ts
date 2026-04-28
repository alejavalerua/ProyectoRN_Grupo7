import { INotificationRepository } from '../../domain/repositories/INotificationRepository';
import { AppNotification } from '../../domain/entities/AppNotification';
import { INotificationRemoteSource } from '../datasources/INotificationRemoteSource';

export class NotificationRepositoryImpl implements INotificationRepository {
  constructor(private remoteSource: INotificationRemoteSource) {}

  async getUserNotifications(userId: string): Promise<AppNotification[]> {
    const data = await this.remoteSource.getUserNotifications(userId);
    
    // Mapeamos el JSON crudo a nuestra entidad fuertemente tipada
    return data.map((json: any) => ({
      id: String(json['_id'] || ''),
      userId: String(json['user_id'] || ''),
      title: String(json['title'] || ''),
      body: String(json['body'] || ''),
      // Parseamos booleanos (pueden venir como string "true" o boolean true desde Roble)
      isRead: json['is_read'] === true || String(json['is_read']).toLowerCase() === 'true',
      // Intentamos parsear la fecha, si falla o no viene, ponemos la fecha actual
      createdAt: json['created_at'] ? new Date(json['created_at']) : new Date(),
    }));
  }

  async markAsRead(notificationId: string): Promise<void> {
    await this.remoteSource.markAsRead(notificationId);
  }
}