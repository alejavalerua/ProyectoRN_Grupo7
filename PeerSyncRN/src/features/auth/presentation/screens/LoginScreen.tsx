import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  StatusBar,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/authContext';


export default function LoginScreen() {
  const navigation = useNavigation<any>();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { login, error, clearError } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) return;
    setLoading(true);
    clearError();
    await login(email, password);
    setLoading(false);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#FAF8FF" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.logoContainer}>
          <Image
            source={{ uri: 'https://portal-na.campusm.exlibrisgroup.com/assets/UniversidaddelNorte/UniversidaddelNorte/logo-uninorte.png' }}
            style={styles.logo}
          />
        </View>

        <Text variant="headlineMedium" style={styles.title}>Inicia Sesión</Text>

        <Text variant="bodyMedium" style={styles.subtitle}>
          ¿No tienes una cuenta?{' '}
          <Text
            style={styles.link}
            onPress={() => navigation.navigate('Signup')}
          >
            Regístrate
          </Text>
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

          <TextInput
            label="Contraseña"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            mode="outlined"
            style={styles.input}
            right={
              <TextInput.Icon
                icon={showPassword ? "eye" : "eye-off"}
                onPress={() => setShowPassword(!showPassword)}
              />
            }
            left={<TextInput.Icon icon="lock" />}
          />
        </View>

        {error && <Text style={styles.errorText}>{error}</Text>}

        <Button
          mode="contained"
          onPress={handleLogin}
          loading={loading}
          style={styles.loginButton}
          buttonColor="#764AB5"
          contentStyle={{ height: 54 }}
        >
          Iniciar Sesión
        </Button>

        <Text style={styles.forgotPassword} onPress={() => navigation.navigate('ForgotPassword')}>
          ¿Olvidaste tu contraseña?
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF8FF', marginRight: 10, marginLeft: 10 },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  logoContainer: { alignItems: 'center', marginBottom: 10 },
  logo: { width: 200, height: 100, resizeMode: 'center' },
  title: { textAlign: 'center', color: '#170F37', fontWeight: '700', marginBottom: 8 },
  subtitle: { textAlign: 'center', color: '#ADAFB5', marginBottom: 40 },
  link: { color: '#764AB5', fontWeight: '700' },
  inputContainer: { marginBottom: 15 },
  input: { backgroundColor: '#FFFFFF', height: 56, marginBottom: 2 },
  loginButton: { marginTop: 10, borderRadius: 12 },
  forgotPassword: { textAlign: 'center', color: '#764AB5', marginTop: 24, fontSize: 14 },
  errorText: { color: '#6d37b8', textAlign: 'center', marginVertical: 3, fontWeight: '500' },
});