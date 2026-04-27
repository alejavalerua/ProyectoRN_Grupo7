import React, { useEffect } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Text, useTheme, Appbar, Surface, Divider, List } from 'react-native-paper';
import { useRoute, useNavigation } from '@react-navigation/native';

import { useTeacherReport } from '../context/TeacherReportContext';

export default function TeacherReportScreen() {
  const theme = useTheme();
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  
  // Recibimos los parámetros de navegación
  const { activityId, activityName, categoryId } = route.params;

  const {
    isLoading,
    groupReports,
    loadReport,
    formatStudentName,
    formatGrade,
    getStudentStatusUI,
  } = useTeacherReport();

  useEffect(() => {
    loadReport(activityId, categoryId);
  }, [activityId, categoryId]);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Appbar.Header style={{ backgroundColor: theme.colors.background }}>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title={`Reporte: ${activityName}`} titleStyle={{ fontSize: 18, fontWeight: 'bold' }} />
      </Appbar.Header>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : groupReports.length === 0 ? (
        <View style={styles.center}>
          <Text style={{ color: theme.colors.onSurfaceVariant }}>
            No hay grupos en esta categoría.
          </Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          {groupReports.map((group) => (
            <Surface key={group.groupId} style={[styles.card, { backgroundColor: theme.colors.surface }]} elevation={2}>
              
              <List.Accordion
                title={group.groupName}
                titleStyle={{ fontWeight: 'bold', fontSize: 16, color: theme.colors.primary }}
                description={`${group.students.length} estudiantes`}
                descriptionStyle={{ color: theme.colors.onSurfaceVariant }}
                style={{ backgroundColor: 'transparent' }}
              >
                <Divider />
                
                {group.students.map((student) => {
                  const statusUI = getStudentStatusUI(student.isComplete);

                  return (
                    <View key={student.email}>
                      <List.Item
                        title={formatStudentName(student.firstName, student.lastName)}
                        titleStyle={{ fontWeight: 'bold', color: theme.colors.onSurface }}
                        description={() => (
                          <View style={{ marginTop: 4 }}>
                            <Text style={{ fontSize: 12, color: theme.colors.onSurfaceVariant }}>
                              {student.email}
                            </Text>
                            <View style={[styles.statusBadge, { backgroundColor: statusUI.bgColor, marginTop: 4 }]}>
                              <Text style={{ fontSize: 11, color: statusUI.textColor, fontWeight: 'bold' }}>
                                {statusUI.text}
                              </Text>
                            </View>
                          </View>
                        )}
                        right={() => (
                          <View style={{ justifyContent: 'center', paddingRight: 10 }}>
                            <View style={[styles.gradeCircle, { backgroundColor: theme.colors.primaryContainer }]}>
                              <Text style={{ fontWeight: 'bold', color: theme.colors.primary, fontSize: 16 }}>
                                {formatGrade(student.finalGrade)}
                              </Text>
                            </View>
                          </View>
                        )}
                      />
                      <Divider />
                    </View>
                  );
                })}
              </List.Accordion>
            </Surface>
          ))}
          <View style={{ height: 40 }} />
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { padding: 16 },
  card: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  gradeCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
});