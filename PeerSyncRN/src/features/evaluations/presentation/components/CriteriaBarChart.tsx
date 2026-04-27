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

  // Filtrar la barra "General" si así se solicita
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

  // Generamos los marcadores del eje Y (ej: 5, 4, 3, 2, 1, 0)
  const yAxisLabels = Array.from({ length: maxY + 1 }, (_, i) => maxY - i);

  return (
    <View style={styles.container}>
      {/* EJE Y (Líneas y Textos) */}
      <View style={styles.yAxisContainer}>
        {yAxisLabels.map((val) => (
          <View key={`y-${val}`} style={styles.yAxisRow}>
            <Text style={[styles.yAxisText, { color: theme.colors.onSurfaceVariant }]}>
              {val}
            </Text>
            {/* Línea horizontal punteada/sólida de fondo */}
            <View style={[styles.gridLine, { backgroundColor: theme.colors.outlineVariant }]} />
          </View>
        ))}
      </View>

      {/* BARRAS Y EJE X */}
      <View style={styles.barsArea}>
        {visibleData.map((item, index) => {
          // Calculamos la altura de la barra en porcentaje
          const barHeightPercent = Math.min((item.value / maxY) * 100, 100);

          return (
            <View key={`bar-${index}`} style={styles.barColumn}>
              {/* Contenedor de la barra para que crezca desde abajo */}
              <View style={styles.barWrapper}>
                <View
                  style={[
                    styles.barFill,
                    {
                      height: `${barHeightPercent}%`,
                      backgroundColor: theme.colors.secondary, // El color morado/secundario que usabas
                    },
                  ]}
                />
              </View>
              {/* Etiqueta del eje X */}
              <Text
                style={[styles.xAxisText, { color: theme.colors.onSurfaceVariant }]}
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

// Utilidad estática extraída del código Dart original para sacar el promedio general
export const extractGeneralValue = (data: ChartPoint[]): number | null => {
  const general = data.find((item) => item.label.toLowerCase() === 'general');
  return general ? general.value : null;
};

const styles = StyleSheet.create({
  container: {
    height: 240,
    flexDirection: 'row',
  },
  emptyContainer: {
    height: 240,
    justifyContent: 'center',
    alignItems: 'center',
  },
  yAxisContainer: {
    position: 'absolute',
    top: 0,
    bottom: 40, // Dejamos espacio para el texto del eje X
    left: 0,
    right: 0,
    justifyContent: 'space-between',
  },
  yAxisRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  yAxisText: {
    width: 20,
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'right',
    marginRight: 8,
  },
  gridLine: {
    flex: 1,
    height: 1,
    opacity: 0.5,
  },
  barsArea: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    marginLeft: 28, // Espacio para los números del eje Y
    paddingBottom: 40, // Espacio para el texto inferior
  },
  barColumn: {
    alignItems: 'center',
    width: 50,
  },
  barWrapper: {
    height: 200, // Altura máxima de la barra
    width: 24,
    justifyContent: 'flex-end',
  },
  barFill: {
    width: '100%',
    borderRadius: 8,
  },
  xAxisText: {
    position: 'absolute',
    bottom: -35,
    fontSize: 11,
    fontWeight: '500',
    textAlign: 'center',
    width: 60,
  },
});