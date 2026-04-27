import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, useTheme, Surface, Icon } from 'react-native-paper';

interface HomeCourseCardProps {
  title: string;
  subtitle: string;
  onTap: () => void;
  style?: any;
}

export const HomeCourseCard: React.FC<HomeCourseCardProps> = ({ title, subtitle, onTap, style }) => {
  const theme = useTheme();

  return (
    <Surface style={[styles.card, { backgroundColor: theme.colors.surface }, style]} elevation={2}>
      <TouchableOpacity activeOpacity={0.7} onPress={onTap} style={styles.touchable}>
        
        <View style={[styles.iconContainer, { backgroundColor: theme.colors.primaryContainer }]}>
          <Icon source="school" size={20} color={theme.colors.primary} />
        </View>
        
        <Text variant="titleMedium" numberOfLines={2} style={[styles.title, { color: theme.colors.onSurface }]}>
          {title}
        </Text>
        
        <Text variant="bodySmall" numberOfLines={2} style={[styles.description, { color: theme.colors.onSurfaceVariant }]}>
          Contenido reciente del curso
        </Text>

        <View style={{ flex: 1 }} /> {/* Espaciador para empujar el tag hacia abajo */}

        <View style={[styles.tag, { backgroundColor: theme.colors.secondaryContainer }]}>
          <Icon source="account-group" size={14} color={theme.colors.secondary} />
          <Text style={[styles.tagText, { color: theme.colors.secondary }]}>
            {subtitle}
          </Text>
        </View>

      </TouchableOpacity>
    </Surface>
  );
};

const styles = StyleSheet.create({
  card: {
    height: 190,
    borderRadius: 16,
    flex: 1,
  },
  touchable: {
    padding: 16,
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  description: {
    marginBottom: 8,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  tagText: {
    fontSize: 10,
    fontWeight: 'bold',
    marginLeft: 4,
  },
});