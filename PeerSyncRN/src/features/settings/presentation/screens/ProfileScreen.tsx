import React from 'react';
import { View, StyleSheet, ScrollView, Alert, Platform } from 'react-native';
import { Text, useTheme, Avatar, List, Surface, Divider } from 'react-native-paper';
import { useAuth } from '../../../auth/presentation/context/authContext';
import { showAlert } from '../../../../core/utils/alerts';

export default function ProfileScreen() {
  const theme = useTheme();
  
  // Consumimos nuestro contexto de autenticación
  const { user, signOut } = useAuth();

  // Valores por defecto seguros
  const name = user?.name || 'Usuario';
  const email = user?.email || 'usuario@ejemplo.com';
  const firstLetter = email.charAt(0).toUpperCase();

  const handleSignOut = async () => {
    // Si estamos en entorno Web, usamos el confirm nativo del navegador
    if (Platform.OS === 'web') {
      const confirm = window.confirm("¿Estás seguro de que quieres salir?");
      if (confirm) {
        try {
          await signOut();
        } catch (error) {
          console.error("Error al cerrar sesión:", error);
        }
      }
    } else {
      // Si estamos en Android/iOS, usamos el Alert nativo de React Native
      Alert.alert(
        "Cerrar Sesión",
        "¿Estás seguro de que quieres salir?",
        [
          { text: "Cancelar", style: "cancel" },
          { 
            text: "Salir", 
            style: "destructive",
            onPress: async () => {
              try {
                await signOut();
              } catch (error) {
                console.error("Error al cerrar sesión:", error);
              }
            } 
          }
        ]
      );
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Encabezado */}
        <Text variant="headlineSmall" style={[styles.headerTitle, { color: theme.colors.primary }]}>
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
          <Text variant="headlineSmall" style={[styles.nameText, { color: theme.colors.onBackground }]}>
            {name}
          </Text>
          <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
            {email}
          </Text>
        </View>

        {/* Tarjeta de Configuraciones */}
        <Surface style={[styles.settingsCard, { backgroundColor: theme.colors.surface }]} elevation={1}>
          <List.Item
            title="Notificaciones"
            left={props => <List.Icon {...props} icon="bell-outline" color={theme.colors.primary} />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => showAlert('Notificaciones', 'Próximamente...')}
          />
          <Divider />
          <List.Item
            title="Privacidad y seguridad"
            left={props => <List.Icon {...props} icon="shield-outline" color={theme.colors.primary} />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => showAlert('Privacidad', 'Próximamente...')}
          />
          <Divider />
          <List.Item
            title="Cerrar sesión"
            titleStyle={{ color: theme.colors.error, fontWeight: 'bold' }}
            left={props => <List.Icon {...props} icon="logout" color={theme.colors.error} />}
            onPress={handleSignOut}
          />
        </Surface>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 24, paddingTop: 60 },
  headerTitle: { fontWeight: 'bold', marginBottom: 40 },
  userInfoContainer: { alignItems: 'center', marginBottom: 40 },
  nameText: { fontWeight: 'bold', marginTop: 16, marginBottom: 4 },
  settingsCard: { borderRadius: 16, overflow: 'hidden' },
});