import React, { useMemo, useState } from 'react';
import { View, StyleSheet, Text as RNText, LayoutChangeEvent } from 'react-native';
import { useTheme } from 'react-native-paper';
import Svg, { Path, Circle, Line, Text as SvgText } from 'react-native-svg';
import { ChartPoint } from '../../domain/entities/ChartPoint';

interface StudentTrendChartProps {
  data: ChartPoint[];
  maxY?: number;
}

export const StudentTrendChart: React.FC<StudentTrendChartProps> = ({
  data,
  maxY = 5,
}) => {
  const theme = useTheme();
  const [containerWidth, setContainerWidth] = useState(0);

  const onLayoutContainer = (event: LayoutChangeEvent) => {
    const width = event.nativeEvent.layout.width;
    if (width !== containerWidth) {
      setContainerWidth(width);
    }
  };

  const safeData = useMemo(() => (data && data.length > 0 ? data : []), [data]);

  if (safeData.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <RNText
          style={{
            color: theme.colors.onSurfaceVariant,
            textAlign: 'center',
          }}
        >
          No hay suficientes datos para calcular la tendencia.
        </RNText>
      </View>
    );
  }

  const chartHeight = 230;

  return (
    <View style={styles.wrapper} onLayout={onLayoutContainer}>
      {containerWidth > 0 ? (
        <ChartSvg
          width={containerWidth}
          height={chartHeight}
          data={safeData}
          maxY={maxY}
        />
      ) : (
        <View style={{ height: chartHeight }} />
      )}
    </View>
  );
};

function ChartSvg({
  width,
  height,
  data,
  maxY,
}: {
  width: number;
  height: number;
  data: ChartPoint[];
  maxY: number;
}) {
  const leftPadding = 28;
  const rightPadding = 8;
  const topPadding = 28;
  const bottomPadding = 46;

  const drawableWidth = width - leftPadding - rightPadding;
  const drawableHeight = height - topPadding - bottomPadding;

  const stepX = data.length > 1 ? drawableWidth / (data.length - 1) : 0;

  const toX = (index: number) => leftPadding + index * stepX;
  const toY = (value: number) =>
    topPadding + drawableHeight - (value / maxY) * drawableHeight;

  const points = data.map((point, index) => ({
    x: toX(index),
    y: toY(point.value),
    label: point.label,
    value: point.value,
  }));

  const buildSmoothLinePath = () => {
    if (points.length === 1) {
      return `M ${points[0].x} ${points[0].y}`;
    }

    let d = `M ${points[0].x} ${points[0].y}`;

    for (let i = 0; i < points.length - 1; i++) {
      const current = points[i];
      const next = points[i + 1];
      const controlX = (current.x + next.x) / 2;

      d += ` C ${controlX} ${current.y}, ${controlX} ${next.y}, ${next.x} ${next.y}`;
    }

    return d;
  };

  const buildAreaPath = () => {
    const linePath = buildSmoothLinePath();
    const last = points[points.length - 1];
    const first = points[0];
    const baseY = topPadding + drawableHeight;

    return `${linePath} L ${last.x} ${baseY} L ${first.x} ${baseY} Z`;
  };

  const linePath = buildSmoothLinePath();
  const areaPath = buildAreaPath();

  const truncateLabel = (label: string, max = 11) => {
    if (label.length <= max) return label;
    return `${label.slice(0, max - 3)}...`;
  };

  return (
    <View>
      <Svg width={width} height={height}>
        {[0, 1, 2, 3, 4, 5].map((tick) => {
          const y = toY(tick);
          return (
            <React.Fragment key={tick}>
              <Line
                x1={leftPadding}
                y1={y}
                x2={width - rightPadding}
                y2={y}
                stroke="#D7D4E3"
                strokeWidth={1}
              />
              <SvgText
                x={leftPadding - 18}
                y={y + 4}
                fontSize="12"
                fill="#B3ADCC"
                textAnchor="end"
              >
                {tick}
              </SvgText>
            </React.Fragment>
          );
        })}

        <Path d={areaPath} fill="rgba(169, 142, 221, 0.22)" />

        <Path
          d={linePath}
          fill="none"
          stroke="#A98EDD"
          strokeWidth={5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {points.map((point, index) => (
          <React.Fragment key={index}>
            <SvgText
              x={point.x}
              y={point.y - 14}
              fontSize="12"
              fill="#6E54B5"
              fontWeight="700"
              textAnchor="middle"
            >
              {point.value.toFixed(1)}
            </SvgText>

            <Circle
              cx={point.x}
              cy={point.y}
              r={7.5}
              fill="#A98EDD"
              stroke="#FFFFFF"
              strokeWidth={3}
            />
          </React.Fragment>
        ))}

        {points.map((point, index) => (
          <SvgText
            key={`label-${index}`}
            x={point.x}
            y={height - 8}
            fontSize="12"
            fill="#D0CCD9"
            textAnchor="middle"
          >
            {truncateLabel(point.label)}
          </SvgText>
        ))}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
  },
  emptyContainer: {
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
  },
});