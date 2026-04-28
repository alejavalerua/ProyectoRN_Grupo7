import React from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Text, useTheme, Appbar, Surface, Icon } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useNotification } from '../context/NotificationContext';
import { AppNotification } from '../../domain/entities/AppNotification';

export default function NotificationsScreen() {
  const theme = useTheme();
  const navigation = useNavigation<any>();
  const { notifications, isLoading, unreadCount, markAsRead, markAllAsRead, loadNotifications } = useNotification();

  // Helper para formatear fechas
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-ES', { 
      day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' 
    });
  };

  const renderNotification = ({ item }: { item: AppNotification }) => {
    const isUnread = !item.isRead;

    return (
      <TouchableOpacity 
        activeOpacity={0.7} 
        onPress={() => { if (isUnread) markAsRead(item.id); }}
      >
        <Surface 
          style={[
            styles.card, 
            { backgroundColor: isUnread ? theme.colors.primaryContainer : theme.colors.surface }
          ]} 
          elevation={isUnread ? 2 : 1}
        >
          <View style={styles.cardHeader}>
            <View style={styles.titleRow}>
              {/* Punto indicador de no leído */}
              {isUnread && (
                <View style={[styles.unreadDot, { backgroundColor: theme.colors.primary }]} />
              )}
              <Text 
                variant="titleMedium" 
                style={[styles.title, { color: isUnread ? theme.colors.primary : theme.colors.onSurface }]}
              >
                {item.title}
              </Text>
            </View>
            <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
              {formatDate(item.createdAt)}
            </Text>
          </View>
          
          <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, marginTop: 4 }}>
            {item.body}
          </Text>
        </Surface>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Appbar.Header style={{ backgroundColor: theme.colors.background }}>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Notificaciones" titleStyle={{ fontWeight: 'bold' }} />
        {unreadCount > 0 && (
          <Appbar.Action 
            icon="check-all" 
            onPress={markAllAsRead} 
          />
        )}
      </Appbar.Header>

      {isLoading && notifications.length === 0 ? (
        <ActivityIndicator size="large" color={theme.colors.primary} style={styles.loader} />
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={renderNotification}
          refreshing={isLoading}
          onRefresh={loadNotifications}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Icon source="bell-sleep-outline" size={60} color={theme.colors.onSurfaceVariant} />
              <Text variant="titleMedium" style={[styles.emptyText, { color: theme.colors.onSurfaceVariant }]}>
                No tienes notificaciones
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loader: { flex: 1, justifyContent: 'center' },
  listContent: { padding: 16, paddingBottom: 40 },
  card: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: 8,
  },
  title: {
    fontWeight: 'bold',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 100,
  },
  emptyText: {
    marginTop: 16,
    fontWeight: 'bold',
  },
});