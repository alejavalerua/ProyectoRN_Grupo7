import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TextInput, useTheme } from 'react-native-paper';

interface AuthTextFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  icon: string;
  isPassword?: boolean;
  isEmail?: boolean;
  errorText?: string | null;
}

export const AuthTextField: React.FC<AuthTextFieldProps> = ({
  label, value, onChangeText, icon, isPassword = false, isEmail = false, errorText
}) => {
  const theme = useTheme();
  const [obscureText, setObscureText] = useState(isPassword);

  return (
    <View style={styles.container}>
      <TextInput
        mode="outlined"
        label={label}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={obscureText}
        keyboardType={isEmail ? 'email-address' : 'default'}
        autoCapitalize={isEmail ? 'none' : 'sentences'}
        left={<TextInput.Icon icon={icon} color={theme.colors.primary} />}
        right={
          isPassword ? (
            <TextInput.Icon
              icon={obscureText ? 'eye-off' : 'eye'}
              onPress={() => setObscureText(!obscureText)}
              color={theme.colors.primary}
            />
          ) : null
        }
        textColor={theme.colors.onSurface} 
        style={{ backgroundColor: theme.colors.surfaceVariant }}
        outlineColor={theme.colors.outline}
        activeOutlineColor={theme.colors.primary}
      />
      {errorText ? <Text style={styles.errorText}>{errorText}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: 15 },
  errorText: { color: '#FF5252', fontSize: 12, marginTop: 4, marginLeft: 10, fontWeight: 'bold' }
});