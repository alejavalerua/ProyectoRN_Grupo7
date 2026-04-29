import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { ChartPoint } from '../../domain/entities/ChartPoint';

interface CriteriaBarChartProps {
  data: ChartPoint[];
  maxY?: number;
  hideGeneralBar?: boolean;
}

export const CriteriaBarChart: React.FC<CriteriaBarChartProps> = ({
  data,
  maxY = 5,
  hideGeneralBar = false,
}) => {
  const theme = useTheme();

  const visibleData = hideGeneralBar
    ? data.filter((item) => item.label.toLowerCase() !== 'general')
    : data;

  if (visibleData.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={{ color: theme.colors.onSurfaceVariant }}>Sin datos</Text>
      </View>
    );
  }

  const yAxisLabels = Array.from({ length: maxY + 1 }, (_, i) => maxY - i);
  const plotHeight = 200;

  return (
    <View style={styles.container}>
      {/* Grilla de fondo */}
      <View style={[styles.gridLayer, { height: plotHeight }]}>
        {yAxisLabels.map((val) => (
          <View key={`y-${val}`} style={styles.gridRow}>
            <Text
              style={[
                styles.yAxisText,
                { color: theme.colors.onSurfaceVariant },
              ]}
            >
              {val}
            </Text>
            <View
              style={[
                styles.gridLine,
                { backgroundColor: theme.colors.outlineVariant },
              ]}
            />
          </View>
        ))}
      </View>

      {/* Columnas */}
      <View style={styles.columnsWrapper}>
        {visibleData.map((item, index) => {
          const barHeight = Math.max((item.value / maxY) * plotHeight, 2);

          return (
            <View key={`bar-${index}`} style={styles.column}>
              <Text
                style={[
                  styles.valueText,
                  { color: theme.colors.onSurface },
                ]}
              >
                {item.value.toFixed(1)}
              </Text>

              <View style={[styles.plotColumnArea, { height: plotHeight }]}>
                <View
                  style={[
                    styles.barFill,
                    {
                      height: barHeight,
                      backgroundColor: theme.colors.secondary,
                    },
                  ]}
                />
              </View>

              <Text
                style={[
                  styles.xAxisText,
                  { color: theme.colors.onSurfaceVariant },
                ]}
                numberOfLines={2}
              >
                {item.label}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

export const extractGeneralValue = (data: ChartPoint[]): number | null => {
  const general = data.find((item) => item.label.toLowerCase() === 'general');
  return general ? general.value : null;
};

const styles = StyleSheet.create({
  container: {
    height: 300,
    position: 'relative',
  },
  emptyContainer: {
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Grilla
  gridLayer: {
    position: 'absolute',
    top: 28,
    left: 0,
    right: 0,
    justifyContent: 'space-between',
  },
  gridRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  yAxisText: {
    width: 24,
    marginRight: 10,
    textAlign: 'right',
    fontSize: 12,
    fontWeight: '600',
  },
  gridLine: {
    flex: 1,
    height: 1,
    opacity: 0.55,
  },

  // Columnas
  columnsWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-start',
    marginLeft: 34,
    paddingTop: 0,
  },
  column: {
    width: 64,
    alignItems: 'center',
  },
  valueText: {
    height: 20,
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 8,
  },
  plotColumnArea: {
    width: 30,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  barFill: {
    width: 30,
    borderRadius: 10,
    minHeight: 2,
  },
  xAxisText: {
    marginTop: 10,
    fontSize: 11,
    fontWeight: '500',
    textAlign: 'center',
    width: 74,
  },
});