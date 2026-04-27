import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Surface, useTheme, Icon } from 'react-native-paper';

interface ActivityCardProps {
  title: string;
  month: string;
  day: string;
  statusTag: string;
  statusDetail: string;
  dateBgColor: string;
  dateTextColor: string;
  onTap: () => void;
}

export const ActivityCard: React.FC<ActivityCardProps> = ({
  title,
  month,
  day,
  statusTag,
  statusDetail,
  dateBgColor,
  dateTextColor,
  onTap,
}) => {
  const theme = useTheme();

  return (
    <Surface style={[styles.card, { backgroundColor: theme.colors.surface }]} elevation={2}>
      <TouchableOpacity activeOpacity={0.8} onPress={onTap} style={styles.content}>
        
        {/* Caja de Fecha */}
        <View style={[styles.dateBox, { backgroundColor: dateBgColor }]}>
          <Text style={[styles.monthText, { color: dateTextColor }]}>{month}</Text>
          <Text style={[styles.dayText, { color: dateTextColor }]}>{day}</Text>
        </View>

        {/* Detalles de la actividad */}
        <View style={styles.details}>
          <Text variant="titleMedium" style={[styles.title, { color: theme.colors.onSurface }]} numberOfLines={1}>
            {title}
          </Text>
          
          <View style={styles.tagRow}>
            <Text style={[styles.tag, { color: theme.colors.primary }]}>{statusTag}</Text>
            <Text style={[styles.detailText, { color: theme.colors.onSurfaceVariant }]}>{statusDetail}</Text>
          </View>
        </View>

        {/* Flecha */}
        <Icon source="chevron-right" size={24} color={theme.colors.onSurfaceVariant} />
      </TouchableOpacity>
    </Surface>
  );
};

const styles = StyleSheet.create({
  card: { borderRadius: 16, overflow: 'hidden' },
  content: { flexDirection: 'row', padding: 12, alignItems: 'center' },
  dateBox: { width: 55, height: 60, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  monthText: { fontSize: 11, fontWeight: 'bold', textTransform: 'uppercase' },
  dayText: { fontSize: 20, fontWeight: '900' },
  details: { flex: 1, marginLeft: 16, justifyContent: 'center' },
  title: { fontWeight: 'bold', marginBottom: 4 },
  tagRow: { flexDirection: 'row', alignItems: 'center' },
  tag: { fontSize: 12, fontWeight: 'bold', marginRight: 6 },
  detailText: { fontSize: 12 },
});