import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Surface, useTheme } from 'react-native-paper';

interface AnalyticsCardProps {
  title: string;
  subtitle: string;
  trailing?: React.ReactNode;
  chart: React.ReactNode;
  footer?: React.ReactNode;
}

export const AnalyticsCard: React.FC<AnalyticsCardProps> = ({
  title,
  subtitle,
  trailing,
  chart,
  footer,
}) => {
  const theme = useTheme();

  return (
    <Surface style={[styles.card, { backgroundColor: theme.colors.surface }]} elevation={2}>
      <View style={styles.header}>
        <View style={styles.textContainer}>
          <Text variant="titleMedium" style={[styles.title, { color: theme.colors.onSurface }]}>
            {title}
          </Text>
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
            {subtitle}
          </Text>
        </View>
        {trailing && <View style={styles.trailing}>{trailing}</View>}
      </View>

      <View style={styles.chartContainer}>
        {chart}
      </View>

      {footer && <View style={styles.footer}>{footer}</View>}
    </Surface>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    padding: 20,
    marginVertical: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 18,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontWeight: '800',
    marginBottom: 4,
  },
  trailing: {
    marginLeft: 10,
  },
  chartContainer: {
    marginTop: 10,
  },
  footer: {
    marginTop: 18,
  },
});