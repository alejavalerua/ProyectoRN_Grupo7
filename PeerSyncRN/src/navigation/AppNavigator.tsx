import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../features/auth/presentation/context/authContext';

import MainTabNavigator from './MainTabNavigator';

import LoginScreen from '../features/auth/presentation/screens/LoginScreen';
import SignupScreen from '../features/auth/presentation/screens/SignupScreen';
import ForgotPasswordScreen from '../features/auth/presentation/screens/ForgotPasswordScreen';
import NotificationsScreen from '../features/notifications/presentation/screens/NotificationsScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { user, isCheckingSession } = useAuth();

  if (isCheckingSession) return null;

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {user ? (
        <>
          <Stack.Screen name="MainTabs" component={MainTabNavigator} />
          <Stack.Screen name="Notifications" component={NotificationsScreen} />
        </>
      ) : (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Signup" component={SignupScreen} />
          <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}