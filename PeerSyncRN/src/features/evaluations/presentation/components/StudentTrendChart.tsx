import React from 'react';
import { View, StyleSheet, Text as RNText } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { ChartPoint } from '../../domain/entities/ChartPoint';

interface StudentTrendChartProps {
  data: ChartPoint[];
  maxY?: number; // Por defecto asumiremos que las notas van de 0 a 5.0
}

export const StudentTrendChart: React.FC<StudentTrendChartProps> = ({ data, maxY = 5.0 }) => {
  const theme = useTheme();

  // 1. Estado vacío
  if (!data || data.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center' }}>
          No hay suficientes datos para calcular la tendencia.
        </Text>
      </View>
    );
  }

  // 2. Cálculos matemáticos para la escala
  // Aseguramos que la gráfica crezca si hay un valor atípico mayor a maxY
  const maxChartValue = Math.max(maxY, ...data.map(d => d.value));

  // 3. Renderizado Flexbox
  return (
    <View style={styles.container}>
      <View style={styles.chartArea}>
        {data.map((point, index) => {
          // Cálculo de altura porcentual
          const heightPercentage = maxChartValue > 0 ? (point.value / maxChartValue) * 100 : 0;
          
          // Lógica visual: Colores semánticos para las notas
          let barColor = theme.colors.primary;
          if (point.value < 3.0) {
            barColor = theme.colors.error; // Nota deficiente
          } else if (point.value >= 4.5) {
            barColor = '#10b981'; // Verde para notas excelentes (Puedes usar theme.colors.tertiary si lo tienes)
          }

          return (
            <View key={index} style={styles.barColumn}>
              {/* Etiqueta flotante con el valor exacto */}
              <Text style={[styles.valueText, { color: theme.colors.onSurface }]}>
                {point.value.toFixed(1)}
              </Text>
              
              {/* Contenedor de la barra (Riel) */}
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceVariant }]}>
                {/* Relleno de la barra animable/flexible */}
                <View 
                  style={[
                    styles.barFill, 
                    { 
                      height: `${heightPercentage}%`, 
                      backgroundColor: barColor 
                    }
                  ]} 
                />
              </View>
              
              {/* Eje X: Nombre de la evaluación truncado */}
              <RNText 
                numberOfLines={1} 
                style={[styles.labelText, { color: theme.colors.onSurfaceVariant }]}
              >
                {point.label}
              </RNText>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 180,
    width: '100%',
    paddingTop: 10,
    paddingBottom: 5,
  },
  emptyContainer: {
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chartArea: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end', // Alinear barras desde abajo
    justifyContent: 'space-around', // Distribuir equitativamente
  },
  barColumn: {
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
    height: '100%',
    justifyContent: 'flex-end',
  },
  barTrack: {
    width: 24, // Ancho de cada barra
    flex: 1, // Toma el espacio restante entre el valor de arriba y la etiqueta de abajo
    borderRadius: 6,
    justifyContent: 'flex-end',
    marginVertical: 4,
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    borderRadius: 6,
  },
  valueText: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  labelText: {
    fontSize: 10,
    textAlign: 'center',
    marginTop: 4,
    maxWidth: 60, // Limita el texto para que no se superponga con la siguiente barra
  },
});