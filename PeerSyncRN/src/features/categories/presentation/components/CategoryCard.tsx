import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Surface, useTheme, IconButton } from 'react-native-paper';

interface CategoryCardProps {
  title: string;
  subtitle: string;
  onTap?: () => void;
  leadingIcon?: string; // Icono de MaterialCommunityIcons
}

export const CategoryCard: React.FC<CategoryCardProps> = ({
  title,
  subtitle,
  onTap,
  leadingIcon = 'account-group', // Equivalente a Icons.group
}) => {
  const theme = useTheme();

  return (
    <Surface style={[styles.card, { backgroundColor: theme.colors.surface }]} elevation={2}>
      <TouchableOpacity onPress={onTap} activeOpacity={0.8} style={styles.cardContent}>
        
        {/* Icono Circular */}
        <View style={[styles.iconContainer, { backgroundColor: theme.colors.primaryContainer }]}>
          <IconButton icon={leadingIcon} iconColor={theme.colors.primary} size={24} />
        </View>

        {/* Textos */}
        <View style={styles.textContainer}>
          <Text variant="titleMedium" style={{ color: theme.colors.onSurface, fontWeight: 'bold' }} numberOfLines={1}>
            {title}
          </Text>
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, fontWeight: '500' }}>
            {subtitle}
          </Text>
        </View>

        {/* Flecha */}
        <View style={[styles.chevronContainer, { borderColor: theme.colors.outlineVariant }]}>
          <IconButton icon="chevron-right" size={18} iconColor={theme.colors.onSurfaceVariant} />
        </View>

      </TouchableOpacity>
    </Surface>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    width: '100%',
    marginVertical: 6,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  iconContainer: {
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
    marginLeft: 16,
    marginRight: 12,
  },
  chevronContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});