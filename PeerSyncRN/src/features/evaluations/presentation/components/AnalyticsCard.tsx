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
    <Surface
      style={[styles.card, { backgroundColor: theme.colors.surface }]}
      elevation={2}
    >
      <View style={styles.header}>
        <View style={styles.textContainer}>
          <Text
            variant="titleMedium"
            style={[styles.title, { color: theme.colors.onSurface }]}
          >
            {title}
          </Text>

          <Text
            variant="bodySmall"
            style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}
          >
            {subtitle}
          </Text>
        </View>

        {trailing ? <View style={styles.trailing}>{trailing}</View> : null}
      </View>

      <View style={styles.chartContainer}>{chart}</View>

      {footer ? <View style={styles.footer}>{footer}</View> : null}
    </Surface>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 18,
    marginVertical: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  textContainer: {
    flex: 1,
    paddingRight: 12,
  },
  title: {
    fontWeight: '800',
    marginBottom: 2,
    fontSize: 18,
  },
  subtitle: {
    lineHeight: 20,
    fontSize: 14,
  },
  trailing: {
    marginLeft: 12,
    alignSelf: 'flex-start',
  },
  chartContainer: {
    marginTop: 8,
  },
  footer: {
    marginTop: 18,
  },
});