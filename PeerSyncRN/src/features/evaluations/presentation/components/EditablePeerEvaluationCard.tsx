import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Surface, useTheme, Icon, Divider, Menu, Button } from 'react-native-paper';

interface EditablePeerEvaluationCardProps {
  studentName: string;
  progressText: string;
  initiallyExpanded?: boolean;
  canExpand?: boolean;
  isReadOnly?: boolean;
  initialPuntualidad?: number;
  initialContribucion?: number;
  initialCompromiso?: number;
  initialActitud?: number;
  onScoresChanged?: (scores: { puntualidad?: number; contribucion?: number; compromiso?: number; actitud?: number }) => void;
}

const CRITERIA_DESCRIPTIONS: Record<string, Record<number, string>> = {
  Puntualidad: {
    2.0: 'Llegó tarde a todas las sesiones o se ausentó constantemente.',
    3.0: 'Llegó tarde con mucha frecuencia y se ausentó varias veces.',
    4.0: 'Llegó puntualmente a la mayoría y no se ausentó con frecuencia.',
    5.0: 'Acudió puntualmente a todas las sesiones de trabajo.',
  },
  Contribución: {
    2.0: 'En todo momento estuvo como observador y no aportó.',
    3.0: 'En algunas ocasiones participó dentro del equipo.',
    4.0: 'Hizo varios aportes; sin embargo, puede ser más propositivo.',
    5.0: 'Sus aportes enriquecieron en todo momento el trabajo del equipo.',
  },
  Compromiso: {
    2.0: 'Mostró poco compromiso con las tareas asignadas.',
    3.0: 'En algunos momentos su compromiso con el trabajo disminuyó.',
    4.0: 'La mayor parte del tiempo asumió tareas con responsabilidad.',
    5.0: 'Mostró en todo momento un compromiso serio con las tareas.',
  },
  Actitud: {
    2.0: 'Mantuvo una actitud negativa hacia las actividades.',
    3.0: 'En algunas oportunidades tuvo una actitud abierta y positiva.',
    4.0: 'La mayor parte del tiempo muestra actitud positiva.',
    5.0: 'Su actitud es positiva y demuestra deseos de calidad.',
  },
};

export const EditablePeerEvaluationCard: React.FC<EditablePeerEvaluationCardProps> = ({
  studentName,
  progressText,
  initiallyExpanded = false,
  canExpand = true,
  isReadOnly = false,
  initialPuntualidad,
  initialContribucion,
  initialCompromiso,
  initialActitud,
  onScoresChanged,
}) => {
  const theme = useTheme();
  const [isExpanded, setIsExpanded] = useState(initiallyExpanded);

  const [scores, setScores] = useState({
    puntualidad: initialPuntualidad,
    contribucion: initialContribucion,
    compromiso: initialCompromiso,
    actitud: initialActitud,
  });

  useEffect(() => {
    setScores({
      puntualidad: initialPuntualidad,
      contribucion: initialContribucion,
      compromiso: initialCompromiso,
      actitud: initialActitud,
    });
  }, [initialPuntualidad, initialContribucion, initialCompromiso, initialActitud]);

  const handleScoreChange = (criteria: keyof typeof scores, value: number) => {
    const newScores = { ...scores, [criteria]: value };
    setScores(newScores);
    if (onScoresChanged) onScoresChanged(newScores);
  };

  // Color de la etiqueta de progreso
  const getTagStyle = () => {
    const text = progressText.toLowerCase();
    if (text.includes('completado')) return { bg: '#F3EDFF', color: '#7F56D9', border: '#E4D7FF' };
    if (text.includes('cerrada')) return { bg: '#FDECEC', color: '#C15F5F', border: '#F6D0D0' };
    return { bg: theme.colors.elevation.level2, color: theme.colors.onSurfaceVariant, border: theme.colors.outlineVariant };
  };
  const tagStyle = getTagStyle();

  return (
    <Surface style={[styles.card, { backgroundColor: theme.colors.surface }]} elevation={2}>
      <TouchableOpacity activeOpacity={0.8} onPress={() => canExpand && setIsExpanded(!isExpanded)}>
        <View style={styles.headerRow}>
          <View style={[styles.iconContainer, { backgroundColor: theme.colors.primaryContainer }]}>
            <Icon source="account-edit" color={theme.colors.primary} size={24} />
          </View>
          <View style={styles.headerTexts}>
            <Text variant="titleMedium" style={{ fontWeight: 'bold', color: theme.colors.onSurface }}>{studentName}</Text>
            <View style={[styles.tag, { backgroundColor: tagStyle.bg, borderColor: tagStyle.border }]}>
              <Text style={{ color: tagStyle.color, fontSize: 11, fontWeight: 'bold' }}>{progressText}</Text>
            </View>
          </View>
          {canExpand && (
            <Icon source={isExpanded ? 'chevron-up' : 'chevron-down'} size={24} color={theme.colors.onSurface} />
          )}
        </View>
      </TouchableOpacity>

      {isExpanded && canExpand && (
        <View style={styles.expandedContent}>
          <Divider style={{ marginVertical: 16 }} />
          <ScoreSelector title="Puntualidad" criteriaKey="puntualidad" scores={scores} isReadOnly={isReadOnly} onChange={handleScoreChange} />
          <ScoreSelector title="Contribución" criteriaKey="contribucion" scores={scores} isReadOnly={isReadOnly} onChange={handleScoreChange} />
          <ScoreSelector title="Compromiso" criteriaKey="compromiso" scores={scores} isReadOnly={isReadOnly} onChange={handleScoreChange} />
          <ScoreSelector title="Actitud" criteriaKey="actitud" scores={scores} isReadOnly={isReadOnly} onChange={handleScoreChange} />
        </View>
      )}
    </Surface>
  );
};

// --- Subcomponente Selector de Nota con Menú ---
const ScoreSelector = ({ title, criteriaKey, scores, isReadOnly, onChange }: any) => {
  const theme = useTheme();
  const [menuVisible, setMenuVisible] = useState(false);
  
  const currentValue = scores[criteriaKey];
  const description = currentValue ? CRITERIA_DESCRIPTIONS[title][currentValue] : 'Sin evaluar';

  return (
    <View style={styles.evalRow}>
      <View style={{ flex: 1, paddingRight: 10 }}>
        <Text variant="bodyMedium" style={{ fontWeight: 'bold', color: theme.colors.onSurface }}>{title}</Text>
        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginTop: 4 }}>{description}</Text>
      </View>
      
      <Menu
        visible={menuVisible}
        onDismiss={() => setMenuVisible(false)}
        anchor={
          <Button 
            mode="outlined" 
            disabled={isReadOnly} 
            onPress={() => setMenuVisible(true)}
            textColor={currentValue ? theme.colors.onSurface : theme.colors.outline}
            contentStyle={{ flexDirection: 'row-reverse' }}
            icon="chevron-down"
            style={{ borderRadius: 10, borderColor: theme.colors.outlineVariant }}
          >
            {currentValue ? currentValue.toFixed(1) : '-.-'}
          </Button>
        }
      >
        {[5.0, 4.0, 3.0, 2.0].map((val) => (
          <Menu.Item 
            key={val} 
            title={val.toFixed(1)} 
            onPress={() => { onChange(criteriaKey, val); setMenuVisible(false); }} 
          />
        ))}
      </Menu>
    </View>
  );
};

const styles = StyleSheet.create({
  card: { borderRadius: 16, padding: 16, width: '100%' },
  headerRow: { flexDirection: 'row', alignItems: 'center' },
  iconContainer: { width: 46, height: 46, borderRadius: 23, justifyContent: 'center', alignItems: 'center' },
  headerTexts: { flex: 1, paddingHorizontal: 14, alignItems: 'flex-start' },
  tag: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, borderWidth: 1, marginTop: 6 },
  expandedContent: { marginTop: 4 },
  evalRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 20 },
});