import React, { useRef, useState, useEffect } from 'react';
import {
  Keyboard,
  TextInput as RNTextInput,
  StyleSheet,
  StatusBar,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  useColorScheme,
  View,
} from 'react-native';
import { Button, HelperText, Snackbar, Text, TextInput, MD3LightTheme, MD3DarkTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/authContext';

export default function SignupScreen() {
  const navigation = useNavigation<any>();
  const { signup, error, clearError } = useAuth();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('ThePassword!1');
  const [obscurePassword, setObscurePassword] = useState(true);
  const [loading, setLoading] = useState(false);

  const [errors, setErrors] = useState({
    name: '',
    email: '',
    password: '',
  });

  const passwordRef = useRef<RNTextInput>(null);

  // Validación en tiempo real
  useEffect(() => {
    const newErrors = { name: '', email: '', password: '' };

    if (name.trim() && name.trim().split(' ').length < 2) {
      newErrors.name = "Por favor ingresa nombre y apellido";
    }
    if (email.trim() && !email.includes('@uninorte.edu.co')) {
      newErrors.email = "Ingresa un correo @uninorte.edu.co válido";
    }
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (password && !passwordRegex.test(password)) {
      newErrors.password = "Mínimo 8 caracteres (mayúscula, minúscula, número y símbolo)";
    }

    setErrors(newErrors);
  }, [name, email, password]);

  const isFormValid = !errors.name && !errors.email && !errors.password &&
    name.trim() && email.trim() && password.length >= 8;

  const handleSignup = async () => {
    Keyboard.dismiss();
    if (!isFormValid) return;

    setLoading(true);
    clearError();

    try {
      await signup(email.trim(), password, name.trim());
      navigation.navigate('Login');
      console.log("Registro exitoso, redirigiendo a Login...");
    } catch (err: any) {
      console.error("Error en registro:", err);
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
          Crear cuenta
        </Text>

        <Text variant="bodyMedium" style={[styles.subtitle, { color: isDark ? '#CCCCCC' : '#ADAFB5' }]}>
          ¿Ya tienes una cuenta?{' '}
          <Text
            style={[styles.link, { color: !isDark ? '#9877C8' : '#af8ae6' }]}
            onPress={() => navigation.navigate('Login')}
          >
            Inicia sesión
          </Text>
        </Text>

        {/* Nombre Completo */}
        <View style={styles.inputContainer}>
          <TextInput
            label="Nombre completo"
            value={name}
            onChangeText={setName}
            mode="outlined"
            style={[styles.input, { backgroundColor: isDark ? '#2A1F4D' : '#FFFFFF' }]}
            error={!!errors.name}
            theme={{ colors: { error: !isDark ? '#3d3d3d' : '#ffffff' } }}
            left={<TextInput.Icon icon="account" color={isDark ? '#FFFFFF' : '#9877C8'} />}
            returnKeyType="next"
            onSubmitEditing={() => passwordRef.current?.focus()}
          />
          {errors.name && <HelperText type="error" visible style={styles.helper}>{errors.name}</HelperText>}

          {/* Correo Institucional */}
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
            secureTextEntry={obscurePassword}
            mode="outlined"
            style={[styles.input, { backgroundColor: isDark ? '#2A1F4D' : '#FFFFFF' }]}
            error={!!errors.password}
            theme={{ colors: { error: !isDark ? '#3d3d3d' : '#ffffff' } }}
            right={
              <TextInput.Icon
                icon={obscurePassword ? "eye-outline" : "eye-off-outline"}
                onPress={() => setObscurePassword(!obscurePassword)}
              />
            }
            left={<TextInput.Icon icon="lock" color={isDark ? '#FFFFFF' : '#9877C8'} />}
            returnKeyType="done"
            onSubmitEditing={handleSignup}
          />
          {errors.password && <HelperText type="error" visible style={styles.helper}>{errors.password}</HelperText>}
        </View>

        <Button
          mode="contained"
          onPress={handleSignup}
          loading={loading}
          disabled={loading || !isFormValid}
          style={styles.signupButton}
          buttonColor={isDark ? "#8761BE" : "#764AB5"}
          textColor={"#ffffff"}
          contentStyle={{ height: 54 }}
        >
          Registrarse
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
  container: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  logoContainer: { alignItems: 'center', marginBottom: 10 },
  logo: { width: 250, height: 110, resizeMode: 'center' },
  title: { textAlign: 'center', fontWeight: '700', marginBottom: 8 },
  subtitle: { textAlign: 'center', marginBottom: 40 },
  link: { fontWeight: '700' },
  inputContainer: { marginBottom: 15 },
  input: {
    height: 56,
    marginBottom: 4
  },
  helper: {
    color: '#a382d6',
    marginBottom: 6,
    fontSize: 12,
  },
  signupButton: {
    marginTop: 10,
    borderRadius: 12
  },
});