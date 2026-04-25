import React, { useRef, useState, useEffect } from 'react';
import {
  Keyboard,
  StyleSheet,
  StatusBar,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  useColorScheme,
  View,
  TextInput as RNTextInput,
} from 'react-native';
import { Button, HelperText, Snackbar, Text, TextInput } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/authContext';

export default function LoginScreen() {
  const navigation = useNavigation<any>();
  const { login, error, clearError } = useAuth();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('ThePassword!1');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [errors, setErrors] = useState({
    email: '',
    password: '',
  });

  const passwordRef = useRef<RNTextInput>(null);

  // Validación en tiempo real
  useEffect(() => {
    const newErrors = { email: '', password: '' };

    if (email.trim() && !email.includes('@uninorte.edu.co')) {
      newErrors.email = "Ingresa un correo @uninorte.edu.co válido";
    }
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (password && !passwordRegex.test(password)) {
      newErrors.password = "Mínimo 8 caracteres (mayúscula, minúscula, número y símbolo)";
    }

    setErrors(newErrors);
  }, [email, password]);

  const isFormValid = !errors.email && !errors.password && email.trim() && password.length >= 6;

  const handleLogin = async () => {
    Keyboard.dismiss();
    if (!isFormValid) return;

    setLoading(true);
    clearError();

    try {
      await login(email.trim(), password);
      console.log("Login exitoso");
    } catch (err: any) {
      console.error("Error en login:", err);
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

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.logoContainer}>
          <Image
            source={{ uri: 'https://i.ibb.co/k6MQ9qRy/logo.png' }}
            style={styles.logo}
          />
        </View>

        <Text variant="headlineMedium" style={[styles.title, { color: isDark ? '#FFFFFF' : '#170F37' }]}>
          Inicia Sesión
        </Text>

        <Text variant="bodyMedium" style={[styles.subtitle, { color: isDark ? '#CCCCCC' : '#ADAFB5' }]}>
          ¿No tienes una cuenta?{' '}
          <Text
            style={[styles.link, { color: !isDark ? '#9877C8' : '#af8ae6' }]}
            onPress={() => navigation.navigate('Signup')}
          >
            Regístrate
          </Text>
        </Text>

        {/* Correo Institucional */}
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
            left={<TextInput.Icon icon="email" color={isDark ? '#FFFFFF' : '#9877C8'} />}
            returnKeyType="next"
            onSubmitEditing={() => passwordRef.current?.focus()}
          />
          {errors.email && <HelperText type="error" visible style={styles.helper}>{errors.email}</HelperText>}

          {/* Contraseña */}
          <TextInput
            ref={passwordRef}
            label="Contraseña"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            mode="outlined"
            style={[styles.input, { backgroundColor: isDark ? '#2A1F4D' : '#FFFFFF' }]}
            error={!!errors.password}
            theme={{ colors: { error: !isDark ? '#3d3d3d' : '#ffffff' } }}
            right={
              <TextInput.Icon
                icon={showPassword ? "eye-outline" : "eye-off-outline"}
                onPress={() => setShowPassword(!showPassword)}
              />
            }
            left={<TextInput.Icon icon="lock" color={isDark ? '#FFFFFF' : '#9877C8'} />}
            returnKeyType="done"
            onSubmitEditing={handleLogin}
          />
          {errors.password && <HelperText type="error" visible style={styles.helper}>{errors.password}</HelperText>}
        </View>

        <Button
          mode="contained"
          onPress={handleLogin}
          loading={loading}
          disabled={loading || !isFormValid}
          style={styles.loginButton}
          buttonColor={isDark ? "#8761BE" : "#764AB5"}
          textColor={"#ffffff"}
          contentStyle={{ height: 54 }}
        >
          Iniciar Sesión
        </Button>

        <Text
          style={[styles.forgotPassword, { color: isDark ? '#e2ceff' : '#764AB5' }]}
          onPress={() => navigation.navigate('ForgotPassword')}
        >
          ¿Olvidaste tu contraseña?
        </Text>
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
  container: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  logoContainer: { alignItems: 'center', marginBottom: 10 },
  logo: { width: 200, height: 100, resizeMode: 'contain' },
  title: { textAlign: 'center', fontWeight: '700', marginBottom: 8 },
  subtitle: { textAlign: 'center', marginBottom: 40 },
  link: { fontWeight: '700' },
  inputContainer: { marginBottom: 15 },
  input: {
    height: 56,
    marginBottom: 4
  },
  helper: {
    color: '#9877C8',
    marginBottom: 12,
    fontSize: 13,
  },
  loginButton: {
    marginTop: 10,
    borderRadius: 12
  },
  forgotPassword: {
    textAlign: 'center',
    marginTop: 24,
    fontSize: 14
  },
});