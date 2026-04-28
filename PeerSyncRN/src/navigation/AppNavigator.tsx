import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../features/auth/presentation/context/authContext';

// Importamos el nuevo Tab Navigator
import MainTabNavigator from './MainTabNavigator';

// Pantallas Públicas
import LoginScreen from '../features/auth/presentation/screens/LoginScreen';
import SignupScreen from '../features/auth/presentation/screens/SignupScreen';
import ForgotPasswordScreen from '../features/auth/presentation/screens/ForgotPasswordScreen';

// Pantallas de Detalles (Se apilan sobre los tabs)
import StudentCourseDetailScreen from '../features/categories/presentation/screens/StudentCourseDetailScreen';
import TeacherCourseDetailScreen from '../features/categories/presentation/screens/TeacherCourseDetailScreen';
import StudentEvaluationScreen from '../features/evaluations/presentation/screens/StudentEvaluationScreen';
import StudentActivitiesScreen from '../features/evaluations/presentation/screens/StudentActivitiesScreen';
import TeacherCategoryDetailScreen from '../features/categories/presentation/screens/TeacherCategoryDetailScreen';
import TeacherReportScreen from '../features/evaluations/presentation/screens/TeacherReportScreen';
import NotificationsScreen from '../features/notifications/presentation/screens/NotificationsScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { user, isCheckingSession } = useAuth(); 

  if (isCheckingSession) return null; 

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {user ? (
        // FLUJO AUTENTICADO
        <>
          {/* El TabNavigator contiene Cursos, Home y Perfil */}
          <Stack.Screen name="MainTabs" component={MainTabNavigator} />
          
          {/* Las pantallas de detalles van aquí para sobreponerse a los Tabs */}
          <Stack.Screen name="StudentCourseDetail" component={StudentCourseDetailScreen} />
          <Stack.Screen name="TeacherCourseDetail" component={TeacherCourseDetailScreen} />
          <Stack.Screen name="StudentActivities" component={StudentActivitiesScreen} />
          <Stack.Screen name="StudentEvaluation" component={StudentEvaluationScreen} />
          <Stack.Screen name="TeacherCategoryDetail" component={TeacherCategoryDetailScreen} />
          <Stack.Screen name="TeacherReport" component={TeacherReportScreen} />
          <Stack.Screen name="Notifications" component={NotificationsScreen} />
        </>
      ) : (
        // FLUJO PÚBLICO
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Signup" component={SignupScreen} />
          <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}