import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { useAuth } from '../features/auth/presentation/context/authContext';

import LoginScreen from '../features/auth/presentation/screens/LoginScreen';
import SignupScreen from '../features/auth/presentation/screens/SignupScreen';
import ForgotPasswordScreen from '../features/auth/presentation/screens/ForgotPasswordScreen';
import HomeScreen from '../features/home/HomeScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { isLoggedIn, loading } = useAuth();

  if (loading) return null;

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isLoggedIn ? (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Signup" component={SignupScreen} />
          <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        </>
      ) : (
        <Stack.Screen name="Main" component={HomeScreen} />
      )}
    </Stack.Navigator>
  );
}