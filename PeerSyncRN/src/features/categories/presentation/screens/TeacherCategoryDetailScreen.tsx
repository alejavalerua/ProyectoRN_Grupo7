import React, { useEffect, useState, useMemo } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Text, useTheme, Appbar, FAB } from 'react-native-paper';
import { useRoute, useNavigation } from '@react-navigation/native';

import { CreateActivityModal } from '../components/CreateActivityModal';
import { useEvaluation } from '@/src/features/evaluations/presentation/context/EvaluationContext';
import { useEvaluationAnalytics } from '@/src/features/evaluations/presentation/context/EvaluationAnalyticsContext';
import { CriteriaBarChart, extractGeneralValue } from '@/src/features/evaluations/presentation/components/CriteriaBarChart';
import { AnalyticsCard } from '@/src/features/evaluations/presentation/components/AnalyticsCard';
import { ActivityCard } from '@/src/features/evaluations/presentation/components/ActivityCard';

export default function TeacherCategoryDetailScreen() {
  const theme = useTheme();
  const route = useRoute<any>();
  const navigation = useNavigation<any>();

  const { categoryId, categoryName } = route.params;

  const {
    teacherActivities,
    isLoadingTeacherActivities,
    loadTeacherActivities,
    getTeacherActivityUIData,
    saveActivity,
  } = useEvaluation();

  const {
    teacherCategoryCriteriaChart,
    isLoadingTeacherCategoryAnalytics,
    loadTeacherCategoryAnalytics,
  } = useEvaluationAnalytics();

  const [isModalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    loadTeacherActivities(categoryId);
    loadTeacherCategoryAnalytics(categoryId);
  }, [categoryId]);

  const sortedTeacherActivities = useMemo(() => {
    const now = new Date();
    const getPriority = (activity: any) => {
      const isExpired = now > activity.endDate;
      const isUpcoming = now < activity.startDate;
      if (!isExpired && !isUpcoming) return 0;
      if (isUpcoming) return 1;
      return 2;
    };

    return [...teacherActivities].sort((a, b) => {
      const pA = getPriority(a);
      const pB = getPriority(b);
      if (pA !== pB) return pA - pB;
      if (pA === 0) return a.endDate.getTime() - b.endDate.getTime();
      if (pA === 1) return a.startDate.getTime() - b.startDate.getTime();
      return b.endDate.getTime() - a.endDate.getTime();
    });
  }, [teacherActivities]);

  const handleCreateActivity = async (data: any) => {
    setModalVisible(false);

    const startDate = data.startDate || new Date();
    const endDate =
      data.endDate || new Date(new Date().setDate(new Date().getDate() + 7));

    const success = await saveActivity(categoryId, {
      name: data.name,
      description: data.description || '',
      startDate,
      endDate,
      isVisible: data.isPublic ?? false,
    });

    if (success) {
      try {
        await loadTeacherActivities(categoryId);
      } catch (e) {
        console.log('Error refrescando actividades del profesor:', e);
      }

      try {
        await loadTeacherCategoryAnalytics(categoryId);
      } catch (e) {
        console.log('Error refrescando analíticas:', e);
      }
    }
  };

  const generalValue = extractGeneralValue(teacherCategoryCriteriaChart);
  const tagData = {
    label: generalValue ? generalValue.toFixed(1) : 'Sin dato',
    bgColor: generalValue ? '#EDE9FE' : theme.colors.surfaceVariant,
    textColor: generalValue ? '#7C3AED' : theme.colors.onSurfaceVariant,
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Appbar.Header style={{ backgroundColor: theme.colors.background }}>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title={categoryName} titleStyle={{ fontSize: 18, fontWeight: 'bold' }} />
      </Appbar.Header>

      <ScrollView contentContainerStyle={styles.content}>
        <AnalyticsCard
          title="Rendimiento por criterio"
          subtitle="Promedio del grupo en esta categoría"
          trailing={
            <View style={[styles.generalTag, { backgroundColor: tagData.bgColor }]}>
              <Text style={{ color: tagData.textColor, fontSize: 12, fontWeight: 'bold' }}>
                General: {tagData.label}
              </Text>
            </View>
          }
          chart={
            isLoadingTeacherCategoryAnalytics ? (
              <ActivityIndicator style={{ marginTop: 40 }} color={theme.colors.primary} />
            ) : (
              <CriteriaBarChart data={teacherCategoryCriteriaChart} hideGeneralBar />
            )
          }
        />

        <View style={{ height: 24 }} />

        {isLoadingTeacherActivities ? (
          <ActivityIndicator size="large" color={theme.colors.primary} />
        ) : sortedTeacherActivities.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={{ textAlign: 'center', color: theme.colors.onSurfaceVariant, fontSize: 16 }}>
              No hay actividades creadas aún.{'\n'}Toca el botón '+' para comenzar.
            </Text>
          </View>
        ) : (
          sortedTeacherActivities.map((activity) => {
            const uiData = getTeacherActivityUIData(activity);

            const dateBgColor = uiData.isExpired ? theme.colors.surfaceVariant : '#E5DBF5';
            const dateTextColor = uiData.isExpired ? theme.colors.onSurfaceVariant : '#8761BE';

            return (
              <View key={activity.id} style={{ marginBottom: 16 }}>
                <ActivityCard
                  title={activity.name}
                  month={uiData.month}
                  day={uiData.day}
                  statusTag={uiData.statusTag}
                  statusDetail={uiData.statusDetail}
                  dateBgColor={dateBgColor}
                  dateTextColor={dateTextColor}
                  onTap={() => {
                    navigation.navigate('TeacherReport', {
                      activityId: activity.id,
                      activityName: activity.name,
                      categoryId: categoryId,
                    });
                  }}
                />
              </View>
            );
          })
        )}
      </ScrollView>

      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.secondary }]}
        color="white"
        onPress={() => setModalVisible(true)}
      />

      <CreateActivityModal
        visible={isModalVisible}
        onDismiss={() => setModalVisible(false)}
        onCreate={handleCreateActivity}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 100 },
  generalTag: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  emptyContainer: { height: 200, justifyContent: 'center', alignItems: 'center' },
  fab: { position: 'absolute', margin: 16, right: 0, bottom: 0, borderRadius: 28 },
});