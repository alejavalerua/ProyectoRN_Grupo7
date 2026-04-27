import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Surface, useTheme, Icon, Divider } from 'react-native-paper';

interface EvaluationData {
  subtitle: string;
  score: string;
}

interface PeerEvaluationCardProps {
  studentName: string;
  progressText: string;
  initiallyExpanded?: boolean;
  canExpand?: boolean;
  leadingIcon?: string;
  puntualidad: EvaluationData;
  contribucion: EvaluationData;
  compromiso: EvaluationData;
  actitud: EvaluationData;
  general: EvaluationData;
}

export const PeerEvaluationCard: React.FC<PeerEvaluationCardProps> = ({
  studentName,
  progressText,
  initiallyExpanded = false,
  canExpand = true,
  leadingIcon = 'account',
  puntualidad,
  contribucion,
  compromiso,
  actitud,
  general,
}) => {
  const theme = useTheme();
  const [isExpanded, setIsExpanded] = useState(initiallyExpanded);

  const toggleExpand = () => {
    if (canExpand) setIsExpanded(!isExpanded);
  };

  return (
    <Surface style={[styles.card, { backgroundColor: theme.colors.surface }]} elevation={2}>
      <TouchableOpacity activeOpacity={0.8} onPress={toggleExpand} disabled={!canExpand}>
        <View style={styles.headerRow}>
          {/* Icono */}
          <View style={[styles.iconContainer, { backgroundColor: theme.colors.primaryContainer }]}>
            <Icon source={leadingIcon} color={theme.colors.primary} size={24} />
          </View>

          {/* Textos Principales */}
          <View style={styles.headerTexts}>
            <Text variant="titleMedium" style={{ fontWeight: 'bold', color: theme.colors.onSurface }}>
              {studentName}
            </Text>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginTop: 2 }}>
              {progressText}
            </Text>
          </View>

          {/* Flecha o Candado */}
          <View style={styles.actionIcon}>
            {canExpand ? (
              <Icon source={isExpanded ? 'chevron-up' : 'chevron-down'} size={24} color={theme.colors.onSurface} />
            ) : (
              <Icon source="lock" size={20} color={theme.colors.onSurfaceVariant} />
            )}
          </View>
        </View>
      </TouchableOpacity>

      {/* Contenido Desplegable */}
      {isExpanded && canExpand && (
        <View style={styles.expandedContent}>
          <Divider style={{ marginVertical: 12 }} />
          
          <EvaluationRow title="Puntualidad" data={puntualidad} />
          <EvaluationRow title="Contribución" data={contribucion} />
          <EvaluationRow title="Compromiso" data={compromiso} />
          <EvaluationRow title="Actitud" data={actitud} />
          
          <Divider style={{ marginVertical: 12 }} />
          <EvaluationRow title="General" data={general} isBold />
        </View>
      )}
    </Surface>
  );
};

// --- Subcomponente Interno ---
const EvaluationRow = ({ title, data, isBold = false }: { title: string; data: EvaluationData; isBold?: boolean }) => {
  const theme = useTheme();
  return (
    <View style={styles.evalRow}>
      <View style={{ flex: 1 }}>
        <Text variant="bodyMedium" style={{ fontWeight: isBold ? 'bold' : '600', color: theme.colors.onSurface }}>
          {title}
        </Text>
        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
          {data.subtitle}
        </Text>
      </View>
      <View style={[styles.scoreBox, { backgroundColor: theme.colors.elevation.level2, borderColor: theme.colors.outlineVariant }]}>
        <Text style={{ fontWeight: 'bold', color: theme.colors.onSurfaceVariant }}>{data.score}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: { borderRadius: 16, padding: 16, marginBottom: 16 },
  headerRow: { flexDirection: 'row', alignItems: 'center' },
  iconContainer: { width: 46, height: 46, borderRadius: 23, justifyContent: 'center', alignItems: 'center' },
  headerTexts: { flex: 1, paddingHorizontal: 14 },
  actionIcon: { padding: 4 },
  expandedContent: { marginTop: 4 },
  evalRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  scoreBox: { width: 52, height: 38, justifyContent: 'center', alignItems: 'center', borderRadius: 10, borderWidth: 1 },
});