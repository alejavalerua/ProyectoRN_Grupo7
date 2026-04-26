import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';

export const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#764AB5',        // primaryColor
    secondary: '#AF95DE',      // secondaryColor
    background: '#FAF8FF',     // backgroundColor
    surface: '#FFFFFF',        // Fondo de tarjetas claro
    onSurface: '#170F37',      // textColor
    onBackground: '#170F37',   // textColor
    surfaceVariant: '#FFFFFF', // Fondo de inputs en modo claro
    outline: '#DADCE1',        // grayColor300 para bordes
    error: '#FF5252',
  },
};

export const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#8761BE',        // darkPrimary
    secondary: '#AF95DE',      // darkSecondary
    background: '#0F0B1F',     // darkBackground
    surface: '#1A1433',        // darkSurface
    onSurface: '#FFFFFF',      // darkTextPrimary
    onBackground: '#FFFFFF',   // darkTextPrimary
    surfaceVariant: '#1F1838', // darkInputBackground (Fondo de inputs oscuro)
    outline: '#3A3260',        // darkBorder
    error: '#FF5252',
  },
};