import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, Alert } from 'react-native';
import { Button, useTheme } from 'react-native-paper';
import { useAuth } from '../context/authContext';
import { AuthTextField } from '../components/AuthTextField';
import { useNavigation } from '@react-navigation/native';

export default function ForgotPasswordScreen() {
  const theme = useTheme();
  const { sendPasswordReset, isLoading } = useAuth();
  const navigation = useNavigation<any>();

  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);

  // Validación de correo institucional de Uninorte
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

  const handleSendReset = async () => {
    if (!email.trim() || emailError) return;

    const success = await sendPasswordReset(email.trim());
    if (success) {
      Alert.alert(
        "Correo enviado",
        "Se ha enviado un enlace para restablecer tu contraseña a tu correo institucional.",
        [{ text: "OK", onPress: () => navigation.goBack() }]
      );
    }
  };

  return (
    <ScrollView 
      contentContainerStyle={[styles.scrollContainer, { backgroundColor: theme.colors.background }]}
      keyboardShouldPersistTaps="handled"
    >
      <Image 
        source={require('../../../../../assets/images/logo.png')} 
        style={styles.logo} 
        resizeMode="contain" 
      />
      
      <Text style={[styles.title, { color: theme.colors.onBackground }]}>
        Recuperar contraseña
      </Text>
      
      <Text style={[styles.subtitle, { color: theme.dark ? '#B9B4D0' : '#666' }]}>
        Ingresa el correo electrónico asociado a tu cuenta y te enviaremos un enlace para restablecer tu contraseña.
      </Text>

      <View style={[styles.formContainer, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.inputLabel, { color: theme.colors.primary }]}>
          Correo electrónico
        </Text>
        
        <AuthTextField
          label="ejemplo@uninorte.edu.co"
          icon="email-outline"
          isEmail={true}
          value={email}
          onChangeText={validateEmail}
          errorText={emailError}
        />
      </View>

      <Button
        mode="contained"
        onPress={handleSendReset}
        loading={isLoading}
        disabled={isLoading || email.length === 0 || !!emailError}
        style={styles.submitButton}
        contentStyle={styles.submitButtonContent}
        labelStyle={styles.submitButtonText}
      >
        Enviar enlace
      </Button>
      
      <Button 
        mode="text" 
        onPress={() => navigation.goBack()} 
        style={styles.backButton}
        labelStyle={{ color: theme.colors.secondary }}
      >
        Cancelar y volver
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: { 
    flexGrow: 1, 
    paddingHorizontal: 24, 
    paddingTop: 60,
    paddingBottom: 20 
  },
  logo: { 
    height: 100, 
    alignSelf: 'center', 
    marginBottom: 30 
  },
  title: { 
    fontSize: 28, 
    fontWeight: '800', // Replicando el h1 de AppTheme
    marginBottom: 12 
  },
  subtitle: { 
    fontSize: 14, 
    marginBottom: 30, 
    lineHeight: 20 
  },
  formContainer: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  inputLabel: { 
    fontSize: 14, 
    fontWeight: '700', 
    marginBottom: 15 
  },
  submitButton: { 
    borderRadius: 12 
  },
  submitButtonContent: { 
    height: 55 
  },
  submitButtonText: { 
    fontSize: 16, 
    fontWeight: 'bold' 
  },
  backButton: { 
    marginTop: 10 
  }
});