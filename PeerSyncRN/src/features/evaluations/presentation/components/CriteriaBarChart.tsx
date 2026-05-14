import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { ChartPoint } from '../../domain/entities/ChartPoint';

interface CriteriaBarChartProps {
  data: ChartPoint[];
  maxY?: number;
  hideGeneralBar?: boolean;
  showValueLabels?: boolean;
}

export const CriteriaBarChart: React.FC<CriteriaBarChartProps> = ({
  data,
  maxY,
  hideGeneralBar = false,
  showValueLabels = false,
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

  const highestValue = Math.max(...visibleData.map((item) => item.value), 0);

  const resolvedMaxY =
    maxY ??
    (highestValue > 5
      ? Math.max(50, Math.ceil(highestValue / 10) * 10)
      : 5);

  const yStep = resolvedMaxY > 5 ? 10 : 1;
  const yAxisLabels: number[] = [];

  for (let value = resolvedMaxY; value >= 0; value -= yStep) {
    yAxisLabels.push(value);
  }

  const plotHeight = 190;

  return (
    <View style={styles.container}>
      {/* Fondo con eje Y y líneas */}
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

      {/* Barras */}
      <View style={styles.columnsWrapper}>
        {visibleData.map((item, index) => {
          const rawHeight = (item.value / resolvedMaxY) * plotHeight;
          const barHeight = Math.max(Math.min(rawHeight, plotHeight), 4);

          return (
            <View key={`bar-${index}`} style={styles.column}>
              {showValueLabels ? (
                <Text
                  style={[
                    styles.valueText,
                    { color: theme.colors.onSurface },
                  ]}
                >
                  {Number.isInteger(item.value)
                    ? item.value.toString()
                    : item.value.toFixed(1)}
                </Text>
              ) : (
                <View style={styles.valueSpacer} />
              )}

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
                {truncateLabel(item.label)}
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

function truncateLabel(label: string, max = 10): string {
  if (label.length <= max) return label;
  return `${label.slice(0, max - 3)}...`;
}

const styles = StyleSheet.create({
  container: {
    height: 270,
    position: 'relative',
  },
  emptyContainer: {
    height: 270,
    justifyContent: 'center',
    alignItems: 'center',
  },
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
    width: 26,
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
  columnsWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-start',
    marginLeft: 36,
    paddingTop: 0,
  },
  column: {
    width: 72,
    alignItems: 'center',
  },
  valueSpacer: {
    height: 20,
    marginBottom: 8,
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
    minHeight: 4,
  },
  xAxisText: {
    marginTop: 10,
    fontSize: 11,
    fontWeight: '500',
    textAlign: 'center',
    width: 74,
  },
});