import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../features/auth/presentation/context/authContext';
import LoginScreen from '../features/auth/presentation/screens/LoginScreen';
import SignupScreen from '../features/auth/presentation/screens/SignupScreen';
import ForgotPasswordScreen from '../features/auth/presentation/screens/ForgotPasswordScreen';
import HomeScreen from '../features/home/HomeScreen'; // Asegúrate de que esta ruta sea correcta

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { user, isCheckingSession } = useAuth(); // Usamos isCheckingSession

  // Si la app está leyendo la caché al inicio, no renderizamos nada (o un splash screen)
  if (isCheckingSession) return null; 

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {user ? (
        // Flujo autenticado
        <Stack.Screen name="Home" component={HomeScreen} />
      ) : (
        // Flujo público
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Signup" component={SignupScreen} />
          <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}