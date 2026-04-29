import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { Button, useTheme } from 'react-native-paper';
import { useAuth } from '../context/authContext';
import { AuthTextField } from '../components/AuthTextField';
import { useNavigation } from '@react-navigation/native';

const EMAIL_HINT = 'pepitojm@uninorte.edu.co';

export default function LoginScreen() {
  const theme = useTheme();
  const { login, isLoading } = useAuth();
  const navigation = useNavigation<any>();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('ThePassword!1');

  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const validateEmail = (val: string) => {
    setEmail(val);

    if (!val) {
      setEmailError(null);
      return;
    }

    if (!val.endsWith('@uninorte.edu.co')) {
      setEmailError('El correo debe ser @uninorte.edu.co');
    } else {
      setEmailError(null);
    }
  };

  const validatePassword = (val: string) => {
    setPassword(val);
    if (!val) {
      setPasswordError(null);
      return;
    }

    const missing: string[] = [];
    if (val.length < 8) missing.push('8 caracteres');
    if (!/[A-Z]/.test(val)) missing.push('mayúscula');
    if (!/[a-z]/.test(val)) missing.push('minúscula');
    if (!/[0-9]/.test(val)) missing.push('número');
    if (!/[!@#$_\-]/.test(val)) missing.push('símbolo (!@#_-$$)');

    if (missing.length > 0) {
      setPasswordError(`Falta: ${missing.join(', ')}`);
    } else {
      setPasswordError(null);
    }
  };

  const handleLogin = async () => {
    const cleanEmail = email.trim();

    if (!cleanEmail) {
      setEmailError('Ingresa tu correo institucional');
      return;
    }

    await login(cleanEmail, password.trim());
  };

  const canSubmit =
    !isLoading &&
    email.trim().length > 0 &&
    password.length > 0 &&
    !emailError &&
    !passwordError;

  return (
    <ScrollView
      contentContainerStyle={[
        styles.scrollContainer,
        { backgroundColor: theme.colors.background },
      ]}
      keyboardShouldPersistTaps="handled"
    >
      <Image
        source={require('../../../../../assets/images/logo.png')}
        style={styles.logo}
        resizeMode="contain"
      />

      <Text style={[styles.title, { color: theme.colors.onBackground }]}>
        Inicia Sesión
      </Text>

      <View style={styles.row}>
        <Text style={{ color: theme.dark ? '#B0B0B0' : '#8A8E97' }}>
          ¿No tienes una cuenta?{' '}
        </Text>
        <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
          <Text style={{ color: theme.colors.secondary, fontWeight: 'bold' }}>
            Regístrate
          </Text>
        </TouchableOpacity>
      </View>

      <View
        style={[styles.formContainer, { backgroundColor: theme.colors.surface }]}
      >
        <AuthTextField
          label="pepitojm@uninorte.edu.co"
          placeholder={EMAIL_HINT}
          icon="email-outline"
          isEmail={true}
          value={email}
          onChangeText={validateEmail}
          errorText={emailError}
        />

        <AuthTextField
          label="Contraseña"
          icon="lock-outline"
          isPassword={true}
          value={password}
          onChangeText={validatePassword}
          errorText={passwordError}
        />
      </View>

      <TouchableOpacity
        onPress={() => navigation.navigate('ForgotPassword')}
        style={styles.forgotButton}
      >
        <Text
          style={{
            color: theme.dark ? theme.colors.onSurfaceVariant : 'gray',
          }}
        >
          ¿Olvidaste tu contraseña?
        </Text>
      </TouchableOpacity>

      <Button
        mode="contained"
        onPress={handleLogin}
        disabled={!canSubmit}
        loading={isLoading}
        style={styles.loginButton}
        contentStyle={styles.loginButtonContent}
        labelStyle={styles.loginButtonText}
      >
        Iniciar Sesión
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 30,
    paddingVertical: 20,
  },
  logo: {
    height: 120,
    alignSelf: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 40,
  },
  formContainer: {
    borderRadius: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    gap: 12,
  },
  forgotButton: {
    alignSelf: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  loginButton: {
    borderRadius: 15,
  },
  loginButtonContent: {
    height: 55,
  },
  loginButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});