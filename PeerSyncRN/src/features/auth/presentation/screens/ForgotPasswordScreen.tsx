import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  StatusBar,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  useColorScheme,
  Keyboard
} from 'react-native';
import { TextInput, Button, Text, HelperText, Snackbar } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/authContext';
import { Ionicons } from '@expo/vector-icons';

export default function ForgotPasswordScreen() {
  const navigation = useNavigation<any>();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [errors, setErrors] = useState({
    email: '',
  });

  const { forgotPassword, error, clearError } = useAuth();

  // Validación en tiempo real
  useEffect(() => {
    const newErrors = { email: '' };

    if (email.trim() && !email.includes('@uninorte.edu.co')) {
      newErrors.email = "Ingresa un correo @uninorte.edu.co válido";
    }

    setErrors(newErrors);
  }, [email]);

  const isFormValid = !errors.email && email.trim();

  const handleReset = async () => {
    Keyboard.dismiss();
    if (!isFormValid) return;

    setLoading(true);
    clearError();

    try {
      await forgotPassword(email.trim());
      setSent(true);
    } catch (err: any) {
      console.error("Error en recuperación de contraseña:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: isDark ? '#170F37' : '#FAF8FF' }]}
    >
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={isDark ? '#170F37' : '#FAF8FF'}
      />

      {/* Barra superior con flecha */}
      <View style={[styles.header, { backgroundColor: isDark ? '#2A1F4D' : '#F1EDF7' }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={isDark ? '#FFFFFF' : '#170F37'} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <Text variant="headlineMedium" style={[styles.title, { color: isDark ? '#FFFFFF' : '#170F37' }]}>
          ¿Olvidaste tu contraseña?
        </Text>

        <Text variant="bodyMedium" style={[styles.subtitle, { color: isDark ? '#CCCCCC' : '#666' }]}>
          Ingresa tu correo institucional y te enviaremos un enlace para restablecerla.
        </Text>

        <View style={styles.inputContainer}>
          <TextInput
            label="Correo institucional"
            value={email}
            onChangeText={setEmail}
            mode="outlined"
            style={[styles.input, { backgroundColor: isDark ? '#2A1F4D' : '#FFFFFF' }]}
            keyboardType="email-address"
            autoCapitalize="none"
            error={!!errors.email}
            theme={{ colors: { error: !isDark ? '#3d3d3d' : '#ffffff' } }}
            left={<TextInput.Icon icon="email" color={isDark ? '#FFFFFF' : '#764AB5'} />}
          />
        </View>

        {errors.email && <HelperText type="error" visible style={styles.helper}>{errors.email}</HelperText>}
        {sent && (
          <Text variant="bodyMedium" style={[styles.subtitle, { color: isDark ? '#CCCCCC' : '#666', marginBottom: 16 }]}>
            Recibirás un enlace para restablecer tu contraseña. Si no lo ves, revisa tu carpeta de spam.
          </Text>
        )}

        <Button
          mode="contained"
          onPress={handleReset}
          loading={loading}
          disabled={loading || !isFormValid}
          style={styles.resetButton}
          buttonColor={isDark ? "#8761BE" : "#764AB5"}
          textColor={"#ffffff"}
          contentStyle={{ height: 54 }}
        >
          Enviar enlace de recuperación
        </Button>
      </ScrollView>

      <Snackbar
        visible={!!error}
        onDismiss={clearError}
        duration={4000}
        action={{ label: "Cerrar", onPress: clearError }}
      >
        {error}
      </Snackbar>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: StatusBar.currentHeight || 40,
    paddingBottom: 8,
    paddingHorizontal: 20,
  },
  backButton: {
    padding: 8,
    alignSelf: 'flex-start',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 30,
    paddingBottom: 40,
  },
  title: {
    textAlign: 'left',
    fontWeight: '700',
    marginBottom: 12,
    marginTop: 20,
  },
  subtitle: {
    textAlign: 'left',
    marginBottom: 20,
    lineHeight: 22,
  },
  inputContainer: {
    marginBottom: 24,
  },
  input: {
    height: 56,
  },
  resetButton: {
    marginTop: 8,
    borderRadius: 12,
  },
  errorText: {
    color: '#9877C8',
    textAlign: 'center',
    marginBottom: 16,
    fontWeight: '500',
  },
  helper: {
    color: '#a382d6',
    marginBottom: 6,
    fontSize: 12,
  },
});