import { INotificationRemoteSource } from './INotificationRemoteSource';
import { ILocalPreferences } from '../../../../core/iLocalPreferences';

export class NotificationRemoteSourceImpl implements INotificationRemoteSource {
  private dbUrl = 'https://roble-api.openlab.uninorte.edu.co/database/peer_sync_2e18809588';

  constructor(private localPreferences: ILocalPreferences) {}

  async getUserNotifications(userId: string): Promise<any[]> {
    const token = await this.localPreferences.retrieveData<string>('tokenA');
    
    // Construcción segura de URL con parámetros
    const url = new URL(`${this.dbUrl}/read`);
    url.searchParams.append('tableName', 'Notification');
    url.searchParams.append('user_id', userId);

    const res = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (res.status === 200) {
      const data = await res.json();
      return Array.isArray(data) ? data : (data?.data || data?.records || []);
    } else {
      throw new Error('Error al obtener notificaciones');
    }
  }

  // Actualizado según la documentación de Roble (Método PUT)
  async markAsRead(notificationId: string): Promise<void> {
    const token = await this.localPreferences.retrieveData<string>('tokenA');
    
    const res = await fetch(`${this.dbUrl}/update`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        tableName: 'Notification',
        idColumn: '_id',
        idValue: notificationId,
        updates: {
          is_read: true,
        },
      }),
    });
    
    if (res.status !== 200) {
      const errorText = await res.text();
      console.warn(`Aviso: No se pudo marcar como leída. Error: ${errorText}`);
    }
  }
}