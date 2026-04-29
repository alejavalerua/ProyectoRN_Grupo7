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

export default function SignupScreen() {
  const theme = useTheme();
  const { signUp, isLoading } = useAuth();
  const navigation = useNavigation<any>();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [nameError, setNameError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const validateName = (val: string) => {
    setName(val);
    if (!val.trim()) {
      setNameError(null);
      return;
    }

    const words = val.trim().split(/\s+/);
    if (words.length < 2) {
      setNameError('Debe incluir nombre y apellido');
      return;
    }

    const hasInvalidChars = /[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/.test(val);
    if (hasInvalidChars) {
      setNameError('Solo se permiten letras y espacios');
    } else {
      setNameError(null);
    }
  };

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

  const canSubmit =
    !isLoading &&
    name.length > 0 &&
    email.length > 0 &&
    password.length > 0 &&
    !nameError &&
    !emailError &&
    !passwordError;

  const handleSignUp = async () => {
    await signUp(email.trim(), password.trim(), name.trim());
  };

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
        Crear cuenta
      </Text>

      <View style={styles.row}>
        <Text style={{ color: theme.dark ? '#B0B0B0' : '#8A8E97' }}>
          ¿Ya tienes una cuenta?{' '}
        </Text>
        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={{ color: theme.colors.secondary, fontWeight: 'bold' }}>
            Inicia sesión
          </Text>
        </TouchableOpacity>
      </View>

      <View
        style={[styles.formContainer, { backgroundColor: theme.colors.surface }]}
      >
        <AuthTextField
          label="Nombre completo"
          icon="account-outline"
          value={name}
          onChangeText={validateName}
          errorText={nameError}
        />

        <AuthTextField
          label="Correo electrónico"
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

      <Button
        mode="contained"
        onPress={handleSignUp}
        disabled={!canSubmit}
        loading={isLoading}
        style={styles.submitButton}
        contentStyle={styles.submitButtonContent}
        labelStyle={styles.submitButtonText}
      >
        Registrarse
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 30,
    paddingVertical: 40,
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
    marginBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    gap: 12,
  },
  submitButton: {
    borderRadius: 15,
  },
  submitButtonContent: {
    height: 55,
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});