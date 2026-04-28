import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { AppNotification } from '../../domain/entities/AppNotification';
import { INotificationRepository } from '../../domain/repositories/INotificationRepository';
import { useDI } from '../../../../core/di/DIProvider';
import { TOKENS } from '../../../../core/di/tokens';
import { useAuth } from '../../../auth/presentation/context/authContext';
import { showAlert } from '../../../../core/utils/alerts';

interface NotificationContextProps {
  notifications: AppNotification[];
  isLoading: boolean;
  unreadCount: number;
  loadNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextProps | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const container = useDI();
  const repository = container.resolve<INotificationRepository>(TOKENS.NotificationRepo);
  const { user } = useAuth(); // Necesitamos el usuario actual para sacar su email/id

  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Derivamos el conteo de no leídas dinámicamente
  const unreadCount = notifications.filter(n => !n.isRead).length;

  const loadNotifications = useCallback(async () => {
    if (!user?.email) return;

    try {
      setIsLoading(true);
      // Usamos el email como userId basado en cómo maneja la sesión PeerSync
      const result = await repository.getUserNotifications(user.email);
      
      // Ordenamos de más reciente a más antigua
      result.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      
      setNotifications(result);
    } catch (error: any) {
      console.error("Error cargando notificaciones:", error);
    } finally {
      setIsLoading(false);
    }
  }, [repository, user?.email]);

  const markAsRead = async (id: string) => {
    try {
      // Optimistic UI Update: Actualizamos la UI inmediatamente para que sea rápido
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, isRead: true } : n)
      );
      
      // Enviamos la petición al servidor de fondo
      await repository.markAsRead(id);
    } catch (error) {
      console.error("Error al marcar como leída:", error);
      // Si falla, recargamos para tener la verdad del servidor
      await loadNotifications();
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter(n => !n.isRead);
      if (unreadNotifications.length === 0) return;

      setIsLoading(true);
      // Marcamos todas localmente
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));

      // Ejecutamos las promesas en paralelo para mayor velocidad
      await Promise.all(unreadNotifications.map(n => repository.markAsRead(n.id)));
      
    } catch (error) {
      showAlert('Error', 'No se pudieron actualizar algunas notificaciones.');
      await loadNotifications();
    } finally {
      setIsLoading(false);
    }
  };

  // Carga automática cuando el usuario inicia sesión
  useEffect(() => {
    if (user) {
      loadNotifications();
    } else {
      setNotifications([]); // Limpiamos si cierra sesión
    }
  }, [user, loadNotifications]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        isLoading,
        unreadCount,
        loadNotifications,
        markAsRead,
        markAllAsRead,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = (): NotificationContextProps => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotification debe usarse dentro de un NotificationProvider');
  return context;
};