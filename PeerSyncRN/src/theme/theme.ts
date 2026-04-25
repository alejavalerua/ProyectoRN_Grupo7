import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';

export const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#764AB5',        
    secondary: '#AF95DE',
    background: '#FAF8FF',
    surface: '#FFFFFF',
    onSurface: '#170F37',
    outline: '#CCBBE3',
    error: '#FF4D4D',
  },
};

export const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#9877C8',
    secondary: '#AF95DE',
    background: '#170F37',     
    surface: '#2A1F4D',
    onSurface: '#FFFFFF',
    outline: '#CCBBE3',
  },
};