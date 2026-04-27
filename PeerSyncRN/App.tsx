import React from "react";
import { useColorScheme } from "react-native";
import { PaperProvider } from "react-native-paper";
import {
  NavigationContainer,
  DarkTheme,
  DefaultTheme,
} from "@react-navigation/native";

import { DIProvider } from "./src/core/di/DIProvider";
import { AuthProvider } from "./src/features/auth/presentation/context/authContext";

import AppNavigator from "./src/navigation/AppNavigator";

import { darkTheme, lightTheme } from "./src/theme/theme";
import { CourseProvider } from "./src/features/courses/presentation/context/CourseContext";
import { CategoryProvider } from "./src/features/categories/presentation/context/CategoryContext";

export default function App() {
  const scheme = useColorScheme();
  const paperTheme = scheme === "dark" ? darkTheme : lightTheme;

  const navigationTheme = {
    ...(scheme === "dark" ? DarkTheme : DefaultTheme),
    colors: {
      ...(scheme === "dark" ? DarkTheme.colors : DefaultTheme.colors),
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
            <PaperProvider theme={paperTheme}>
              <NavigationContainer theme={navigationTheme}>
                <AppNavigator />
              </NavigationContainer>
            </PaperProvider>
          </CategoryProvider>
        </CourseProvider>
      </AuthProvider>
    </DIProvider>
  );
}
