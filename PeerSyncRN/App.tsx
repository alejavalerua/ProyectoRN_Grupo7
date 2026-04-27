import React from 'react';
import { useColorScheme } from 'react-native';
import { PaperProvider } from 'react-native-paper';
import { NavigationContainer, DarkTheme, DefaultTheme } from '@react-navigation/native';

// 1. Inyección de Dependencias
import { DIProvider } from './src/core/di/DIProvider';

// 2. Providers de cada módulo (Mantenemos este orden lógico)

import { CourseProvider } from './src/features/courses/presentation/context/CourseContext';
import { CategoryProvider } from './src/features/categories/presentation/context/CategoryContext';
import { EvaluationProvider } from './src/features/evaluations/presentation/context/EvaluationContext';
import { EvaluationAnalyticsProvider } from './src/features/evaluations/presentation/context/EvaluationAnalyticsContext';
import { EvaluationFormProvider } from './src/features/evaluations/presentation/context/EvaluationFormContext';
import { TeacherReportProvider } from './src/features/evaluations/presentation/context/TeacherReportContext';

import AppNavigator from './src/navigation/AppNavigator';
import { darkTheme, lightTheme } from './src/theme/theme';
import { AuthProvider } from './src/features/auth/presentation/context/authContext';

export default function App() {
  const scheme = useColorScheme();
  const paperTheme = scheme === 'dark' ? darkTheme : lightTheme;

  const navigationTheme = {
    ...(scheme === 'dark' ? DarkTheme : DefaultTheme),
    colors: {
      ...(scheme === 'dark' ? DarkTheme.colors : DefaultTheme.colors),
      background: paperTheme.colors.background,
      card: paperTheme.colors.surface,
      text: paperTheme.colors.onSurface,
      border: paperTheme.colors.outline,
      primary: paperTheme.colors.primary,
      notification: paperTheme.colors.error,
    },
  };

  return (
    <DIProvider>
      <AuthProvider>
        <CourseProvider>
          <CategoryProvider>
            <EvaluationProvider>
              <EvaluationAnalyticsProvider>
                <EvaluationFormProvider>
                  <TeacherReportProvider>

                    <PaperProvider theme={paperTheme}>
                      <NavigationContainer theme={navigationTheme}>
                        <AppNavigator />
                      </NavigationContainer>
                    </PaperProvider>

                  </TeacherReportProvider>
                </EvaluationFormProvider>
              </EvaluationAnalyticsProvider>
            </EvaluationProvider>
          </CategoryProvider>
        </CourseProvider>
      </AuthProvider>
    </DIProvider>
  );
}