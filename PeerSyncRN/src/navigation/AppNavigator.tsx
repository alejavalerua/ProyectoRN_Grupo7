import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../features/auth/presentation/context/authContext';
import LoginScreen from '../features/auth/presentation/screens/LoginScreen';
import SignupScreen from '../features/auth/presentation/screens/SignupScreen';
import ForgotPasswordScreen from '../features/auth/presentation/screens/ForgotPasswordScreen';
import HomeScreen from '../features/home/HomeScreen'; 

import StudentCoursesScreen from '../features/courses/presentation/screens/StudentCoursesScreen';
import TeacherCoursesScreen from '../features/courses/presentation/screens/TeacherCoursesScreen';
import StudentCourseDetailScreen from '../features/categories/presentation/screens/StudentCourseDetailScreen';
import TeacherCourseDetailScreen from '../features/categories/presentation/screens/TeacherCourseDetailScreen';
import StudentEvaluationScreen from '../features/evaluations/presentation/screens/StudentEvaluationScreen';
import StudentActivitiesScreen from '../features/evaluations/presentation/screens/StudentActivitiesScreen';
import TeacherCategoryDetailScreen from '../features/categories/presentation/screens/TeacherCategoryDetailScreen';
import TeacherReportScreen from '../features/evaluations/presentation/screens/TeacherReportScreen';
const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { user, isCheckingSession } = useAuth(); // Usamos isCheckingSession

  // Si la app está leyendo la caché al inicio, no renderizamos nada (o un splash screen)
  if (isCheckingSession) return null; 

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {user ? (
        // Flujo autenticado (Rutas protegidas)
        <>
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="StudentCourses" component={StudentCoursesScreen} />
          <Stack.Screen name="TeacherCourses" component={TeacherCoursesScreen} />
          <Stack.Screen name="StudentCourseDetail" component={StudentCourseDetailScreen} />
          <Stack.Screen name="TeacherCourseDetail" component={TeacherCourseDetailScreen} />
          <Stack.Screen name="StudentActivities" component={StudentActivitiesScreen} />
          <Stack.Screen name="StudentEvaluation" component={StudentEvaluationScreen} />
          <Stack.Screen name="TeacherCategoryDetail" component={TeacherCategoryDetailScreen} />
          <Stack.Screen name="TeacherReport" component={TeacherReportScreen} />

        </>
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