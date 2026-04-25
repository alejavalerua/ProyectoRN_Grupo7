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

export default function SignupScreen() {
  const navigation = useNavigation<any>();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { signup, error, clearError } = useAuth();

  const handleSignup = async () => {
    if (!name || !email || !password) return;
    setLoading(true);
    clearError();
    await signup(email, password);
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

        <Text variant="headlineMedium" style={styles.title}>Crear cuenta</Text>
        
        <Text variant="bodyMedium" style={styles.subtitle}>
          ¿Ya tienes una cuenta?{' '}
          <Text 
            style={styles.link}
            onPress={() => navigation.navigate('Login')}
          >
            Inicia sesión
          </Text>
        </Text>

        <View style={styles.inputContainer}>
          <TextInput
            label="Nombre completo"
            value={name}
            onChangeText={setName}
            mode="outlined"
            style={styles.input}
            left={<TextInput.Icon icon="account" />}
          />

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
          onPress={handleSignup}
          loading={loading}
          style={styles.signupButton}
          buttonColor="#764AB5"
          contentStyle={{ height: 54 }}
        >
          Registrarse
        </Button>
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
  signupButton: { marginTop: 10, borderRadius: 12 },
  errorText: { color: '#6d37b8', textAlign: 'center', marginVertical: 3, fontWeight: '500' },
});