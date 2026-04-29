import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import {
  Text,
  useTheme,
  Avatar,
  List,
  Surface,
  Divider,
  Portal,
  Modal,
  Button,
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';

import { useAuth } from '../../../auth/presentation/context/authContext';
import { showAlert } from '../../../../core/utils/alerts';

export default function ProfileScreen() {
  const theme = useTheme();
  const navigation = useNavigation<any>();
  const { user, signOut } = useAuth();

  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const name = user?.name || 'Usuario';
  const email = user?.email || 'usuario@ejemplo.com';
  const firstLetter = email.charAt(0).toUpperCase();

  const openLogoutModal = () => setLogoutModalVisible(true);
  const closeLogoutModal = () => {
    if (!isSigningOut) setLogoutModalVisible(false);
  };

  const handleConfirmSignOut = async () => {
    try {
      setIsSigningOut(true);
      await signOut();
      setLogoutModalVisible(false);
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      showAlert('Error', 'No se pudo cerrar sesión');
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Encabezado */}
        <Text
          variant="headlineSmall"
          style={[styles.headerTitle, { color: theme.colors.primary }]}
        >
          Perfil
        </Text>

        {/* Información del Usuario */}
        <View style={styles.userInfoContainer}>
          <Avatar.Text
            size={100}
            label={firstLetter}
            style={{ backgroundColor: theme.colors.primaryContainer }}
            color={theme.colors.onPrimaryContainer}
          />
          <Text
            variant="headlineSmall"
            style={[styles.nameText, { color: theme.colors.onBackground }]}
          >
            {name}
          </Text>
          <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
            {email}
          </Text>
        </View>

        {/* Tarjeta de Configuraciones */}
        <Surface
          style={[styles.settingsCard, { backgroundColor: theme.colors.surface }]}
          elevation={1}
        >
          <List.Item
            title="Notificaciones"
            left={(props) => (
              <List.Icon {...props} icon="bell-outline" color={theme.colors.primary} />
            )}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => navigation.navigate('Notifications')}
          />
          <Divider />

          <List.Item
            title="Privacidad y seguridad"
            left={(props) => (
              <List.Icon {...props} icon="shield-outline" color={theme.colors.primary} />
            )}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => showAlert('Privacidad', 'Próximamente...')}
          />
          <Divider />

          <List.Item
            title="Cerrar sesión"
            titleStyle={{ color: theme.colors.error, fontWeight: 'bold' }}
            left={(props) => (
              <List.Icon {...props} icon="logout" color={theme.colors.error} />
            )}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={openLogoutModal}
          />
        </Surface>
      </ScrollView>

      {/* Modal personalizado de cerrar sesión */}
      <Portal>
        <Modal
          visible={logoutModalVisible}
          onDismiss={closeLogoutModal}
          contentContainerStyle={[
            styles.modalContainer,
            { backgroundColor: theme.colors.surface },
          ]}
        >
          <Text style={[styles.modalTitle, { color: theme.colors.onSurface }]}>
            Cerrar Sesión
          </Text>

          <Text style={[styles.modalMessage, { color: theme.colors.onSurfaceVariant }]}>
            ¿Estás seguro de que quieres salir?
          </Text>

          <View style={styles.modalButtons}>
            <Button
              mode="outlined"
              onPress={closeLogoutModal}
              disabled={isSigningOut}
              style={[
                styles.cancelButton,
                { borderColor: theme.colors.primary },
              ]}
              labelStyle={[
                styles.cancelButtonLabel,
                { color: theme.colors.primary },
              ]}
            >
              Cancelar
            </Button>

            <Button
              mode="contained"
              onPress={handleConfirmSignOut}
              loading={isSigningOut}
              disabled={isSigningOut}
              style={[
                styles.logoutButton,
                { backgroundColor: theme.colors.secondary },
              ]}
              labelStyle={styles.logoutButtonLabel}
            >
              Salir
            </Button>
          </View>
        </Modal>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  scrollContent: {
    padding: 24,
    paddingTop: 60,
  },

  headerTitle: {
    fontWeight: 'bold',
    marginBottom: 40,
  },

  userInfoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },

  nameText: {
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 4,
  },

  settingsCard: {
    borderRadius: 16,
    overflow: 'hidden',
  },

  modalContainer: {
    marginHorizontal: 28,
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
  },

  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 14,
  },

  modalMessage: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 20,
  },

  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },

  cancelButton: {
    borderRadius: 18,
    minWidth: 110,
    borderWidth: 2,
  },

  cancelButtonLabel: {
    fontSize: 16,
    fontWeight: '600',
  },

  logoutButton: {
    borderRadius: 18,
    minWidth: 95,
  },

  logoutButtonLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
});