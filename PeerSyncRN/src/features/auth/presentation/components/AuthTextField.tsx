import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { TextInput, useTheme } from 'react-native-paper';

interface AuthTextFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  icon: string;
  isPassword?: boolean;
  isEmail?: boolean;
  errorText?: string | null;
  placeholder?: string;
}

export const AuthTextField: React.FC<AuthTextFieldProps> = ({
  label,
  value,
  onChangeText,
  icon,
  isPassword = false,
  isEmail = false,
  errorText,
  placeholder,
}) => {
  const theme = useTheme();
  const [obscureText, setObscureText] = useState(isPassword);
  const [isFocused, setIsFocused] = useState(false);

  const ghostOpacity = useRef(new Animated.Value(0)).current;

  const showGhost =
    !!placeholder && !value && !isFocused && !isPassword;

  useEffect(() => {
    Animated.timing(ghostOpacity, {
      toValue: showGhost ? 1 : 0,
      duration: 180,
      useNativeDriver: true,
    }).start();
  }, [showGhost, ghostOpacity]);

  return (
    <View style={styles.container}>
      <View style={styles.inputWrapper}>
        <TextInput
          mode="outlined"
          label={showGhost ? undefined : label}
          value={value}
          onChangeText={onChangeText}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          secureTextEntry={isPassword ? obscureText : false}
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

        {showGhost && placeholder ? (
          <Animated.View
            pointerEvents="none"
            style={[
              styles.ghostContainer,
              {
                opacity: ghostOpacity,
              },
            ]}
          >
            <Text
              style={[
                styles.ghostText,
                { color: theme.dark ? '#8E8E93' : '#9CA3AF' },
              ]}
            >
              {placeholder}
            </Text>
          </Animated.View>
        ) : null}
      </View>

      {errorText ? <Text style={styles.errorText}>{errorText}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 15,
  },
  inputWrapper: {
    position: 'relative',
    justifyContent: 'center',
  },
  ghostContainer: {
    position: 'absolute',
    left: 60,
    right: 20,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  ghostText: {
    fontSize: 16,
  },
  errorText: {
    color: '#FF5252',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 10,
    fontWeight: 'bold',
  },
});