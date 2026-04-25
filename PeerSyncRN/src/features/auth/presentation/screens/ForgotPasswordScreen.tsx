import React, { useState } from 'react';
import { 
  View, 
  StyleSheet, 
  StatusBar, 
  Image, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform,
  TouchableOpacity 
} from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/authContext';
import { Ionicons } from '@expo/vector-icons';   // Asegúrate de tener expo-vector-icons instalado

export default function ForgotPasswordScreen() {
  const navigation = useNavigation<any>();
  
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const { forgotPassword, error, clearError } = useAuth();

  const handleReset = async () => {
    if (!email) return;
    setLoading(true);
    clearError();
    await forgotPassword(email);
    setSent(true);
    setLoading(false);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#FAF8FF" />

      {/* Barra superior con flecha */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#170F37" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <Text variant="headlineMedium" style={styles.title}>
          ¿Olvidaste tu contraseña?
        </Text>
        
        <Text variant="bodyMedium" style={styles.subtitle}>
          Ingresa tu correo institucional y te enviaremos un enlace para restablecerla.
        </Text>

        <View style={styles.inputContainer}>
          <TextInput
            label="Correo institucional"
            value={email}
            onChangeText={setEmail}
            mode="outlined"
            style={styles.input}
            keyboardType="email-address"
            autoCapitalize="none"
            left={<TextInput.Icon icon="email" />}
          />
        </View>

        {error && <Text style={styles.errorText}>{error}</Text>}
        {sent && <Text style={styles.successText}>✅ Enlace enviado a tu correo</Text>}

        <Button
          mode="contained"
          onPress={handleReset}
          loading={loading}
          style={styles.resetButton}
          buttonColor="#764AB5"
          contentStyle={{ height: 54 }}
        >
          Enviar enlace de recuperación
        </Button>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF8FF',
  },
  header: {
    backgroundColor: '#F1EDF7',
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
    color: '#170F37',
    fontWeight: '700',
    marginBottom: 12,
    marginTop: 20,
  },
  subtitle: {
    textAlign: 'left',
    color: '#666',
    marginBottom: 20,
    lineHeight: 22,
  },
  inputContainer: {
    marginBottom: 24,
  },
  input: {
    backgroundColor: '#FFFFFF',
    height: 56,
  },
  resetButton: {
    marginTop: 8,
    borderRadius: 12,
  },
  errorText: {
    color: '#6d37b8',
    textAlign: 'center',
    marginBottom: 16,
  },
  successText: {
    color: '#9e3fb6',
    textAlign: 'center',
    marginBottom: 20,
    fontSize: 16,
  },
});