import React from "react";
import { View, StyleSheet, ScrollView, Alert, Platform } from "react-native";
import {
  Text,
  useTheme,
  Avatar,
  List,
  Surface,
  Divider,
} from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../../../auth/presentation/context/authContext";
import { showAlert } from "../../../../core/utils/alerts";

export default function ProfileScreen() {
  const theme = useTheme();
  const navigation = useNavigation<any>();

  const { user, signOut } = useAuth();

  const name = user?.name || "Usuario";
  const email = user?.email || "usuario@ejemplo.com";
  const firstLetter = email.charAt(0).toUpperCase();

  const handleOpenNotifications = () => {
    const parentNavigation = navigation.getParent();
    if (parentNavigation) {
      parentNavigation.navigate("Notifications");
    } else {
      navigation.navigate("Notifications");
    }
  };

  const handleSignOut = async () => {
    if (Platform.OS === "web") {
      const confirm = window.confirm("¿Estás seguro de que quieres salir?");
      if (confirm) {
        try {
          await signOut();
        } catch (error) {
          console.error("Error al cerrar sesión:", error);
        }
      }
    } else {
      Alert.alert("Cerrar Sesión", "¿Estás seguro de que quieres salir?", [
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
          },
        },
      ]);
    }
  };

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text
          variant="headlineSmall"
          style={[styles.headerTitle, { color: theme.colors.primary }]}
        >
          Perfil
        </Text>

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
          <Text
            variant="bodyMedium"
            style={{ color: theme.colors.onSurfaceVariant }}
          >
            {email}
          </Text>
        </View>

        <Surface
          style={[
            styles.settingsCard,
            { backgroundColor: theme.colors.surface },
          ]}
          elevation={1}
        >
          <List.Item
            title="Notificaciones"
            left={(props) => (
              <List.Icon
                {...props}
                icon="bell-outline"
                color={theme.colors.primary}
              />
            )}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={handleOpenNotifications}
          />
          <Divider />
          <List.Item
            title="Privacidad y seguridad"
            left={(props) => (
              <List.Icon
                {...props}
                icon="shield-outline"
                color={theme.colors.primary}
              />
            )}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => showAlert("Privacidad", "Próximamente...")}
          />
          <Divider />
          <List.Item
            title="Cerrar sesión"
            titleStyle={{ color: theme.colors.error, fontWeight: "bold" }}
            left={(props) => (
              <List.Icon {...props} icon="logout" color={theme.colors.error} />
            )}
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
  headerTitle: { fontWeight: "bold", marginBottom: 40 },
  userInfoContainer: { alignItems: "center", marginBottom: 40 },
  nameText: { fontWeight: "bold", marginTop: 16, marginBottom: 4 },
  settingsCard: { borderRadius: 16, overflow: "hidden" },
});
