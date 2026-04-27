import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// Contexto de Auth para saber el rol del usuario
import { useAuth } from '../features/auth/presentation/context/authContext';

// Importamos las pantallas
import HomeScreen from '../features/home/HomeScreen';
import ProfileScreen from '../features/settings/presentation/screens/ProfileScreen';
import TeacherCoursesScreen from '../features/courses/presentation/screens/TeacherCoursesScreen';
import StudentCoursesScreen from '../features/courses/presentation/screens/StudentCoursesScreen';

const Tab = createBottomTabNavigator();

export default function MainTabNavigator() {
  const theme = useTheme();
  const { user } = useAuth();

  // Determinamos si es profesor (Ajusta 'teacher' al valor exacto que uses en tu base de datos)
  const isTeacher = user?.role === 'teacher';

  return (
    <Tab.Navigator
      initialRouteName="HomeTab"
      screenOptions={{
        headerShown: false, // Ocultamos el header nativo porque ya usamos Appbars en las pantallas
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.onSurfaceVariant,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopWidth: 0,
          elevation: 8, // Sombra en Android
          shadowColor: '#000', // Sombra en iOS
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          height: 65,
          paddingBottom: 10,
          paddingTop: 5,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: 'bold',
        },
      }}
    >
      {/* Pestaña 0: CURSOS */}
      <Tab.Screen
        name="CoursesTab"
        // Mostramos la pantalla correcta según el rol
        component={isTeacher ? TeacherCoursesScreen : StudentCoursesScreen}
        options={{
          tabBarLabel: 'Cursos',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="book-open-variant" color={color} size={size + 2} />
          ),
        }}
      />

      {/* Pestaña 1: HOME */}
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="home" color={color} size={size + 4} />
          ),
        }}
      />

      {/* Pestaña 2: PERFIL */}
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Perfil',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account" color={color} size={size + 2} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}