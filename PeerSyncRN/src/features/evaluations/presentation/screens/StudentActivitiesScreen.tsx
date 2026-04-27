import React, { useEffect } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Text, useTheme, Appbar } from 'react-native-paper';
import { useRoute, useNavigation } from '@react-navigation/native';

import { useEvaluation } from '../context/EvaluationContext';
import { useEvaluationAnalytics } from '../context/EvaluationAnalyticsContext';

import { AnalyticsCard } from '../components/AnalyticsCard';
import { CriteriaBarChart, extractGeneralValue } from '../components/CriteriaBarChart';
import { ActivityCard } from '../components/ActivityCard';
import { showAlert } from '../../../../core/utils/alerts';

export default function StudentActivitiesScreen() {
  const theme = useTheme();
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { categoryId, categoryName } = route.params;

  const { sortedActivities, isLoadingActivities, loadActivities, getActivityUIData } = useEvaluation();
  const { studentCategoryCriteriaChart, isLoadingStudentCategoryAnalytics, loadStudentCategoryAnalytics } = useEvaluationAnalytics();

  useEffect(() => {
    loadActivities(categoryId);
    loadStudentCategoryAnalytics(categoryId);
  }, [categoryId]);

  const generalValue = extractGeneralValue(studentCategoryCriteriaChart);
  const tagData = {
    label: generalValue ? generalValue.toFixed(1) : 'Sin dato',
    bgColor: generalValue ? '#EDE9FE' : theme.colors.surfaceVariant,
    textColor: generalValue ? '#7C3AED' : theme.colors.onSurfaceVariant,
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Appbar.Header style={{ backgroundColor: theme.colors.background }}>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title={`Actividades: ${categoryName}`} titleStyle={{ fontSize: 18, fontWeight: 'bold' }} />
      </Appbar.Header>

      {isLoadingActivities ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          {/* GRÁFICO DE RENDIMIENTO */}
          <AnalyticsCard
            title="Rendimiento por criterio"
            subtitle="Tu promedio en esta categoría"
            trailing={
              <View style={[styles.generalTag, { backgroundColor: tagData.bgColor }]}>
                <Text style={{ color: tagData.textColor, fontSize: 12, fontWeight: 'bold' }}>
                  General: {tagData.label}
                </Text>
              </View>
            }
            chart={
              isLoadingStudentCategoryAnalytics ? (
                <ActivityIndicator style={{ marginTop: 40 }} color={theme.colors.primary} />
              ) : (
                <CriteriaBarChart data={studentCategoryCriteriaChart} hideGeneralBar />
              )
            }
          />

          <View style={{ height: 24 }} />

          {/* LISTA DE ACTIVIDADES */}
          {sortedActivities.length === 0 ? (
            <Text style={{ textAlign: 'center', marginTop: 20, color: theme.colors.onSurfaceVariant }}>
              No hay actividades disponibles.
            </Text>
          ) : (
            sortedActivities.map((activity) => {
              const uiData = getActivityUIData(activity);
              
              // Lógica de colores según estado
              const dateBgColor = uiData.isExpired ? theme.colors.surfaceVariant : '#E5DBF5';
              const dateTextColor = uiData.isExpired ? theme.colors.onSurfaceVariant : '#8761BE';

              return (
                <View key={activity.id} style={{ marginBottom: 16 }}>
                  <ActivityCard
                    title={activity.name}
                    month={uiData.month}
                    day={uiData.day}
                    statusTag={uiData.statusLabel}
                    statusDetail={uiData.statusDetail}
                    dateBgColor={dateBgColor}
                    dateTextColor={dateTextColor}
                    onTap={() => {
                      if (uiData.isActive || uiData.isExpired) {
                        navigation.navigate('StudentEvaluation', {
                          activityId: activity.id,
                          activityName: activity.name,
                          categoryId,
                          visibility: activity.visibility,
                          isExpired: uiData.isExpired,
                        });
                      } else {
                        showAlert('Paciencia', 'Esta actividad aún no comienza.');
                      }
                    }}
                  />
                </View>
              );
            })
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 40 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  generalTag: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
});