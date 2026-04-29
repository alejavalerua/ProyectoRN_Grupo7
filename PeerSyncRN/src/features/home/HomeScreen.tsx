import React, { useEffect, useCallback, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { Text, useTheme, IconButton, Badge } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';

import { useAuth } from '../auth/presentation/context/authContext';
import { useCourse } from '../courses/presentation/context/CourseContext';
import { useCategory } from '../categories/presentation/context/CategoryContext';
import { useEvaluation } from '../evaluations/presentation/context/EvaluationContext';
import { useEvaluationAnalytics } from '../evaluations/presentation/context/EvaluationAnalyticsContext';

import { HomeCourseCard } from './components/HomeCourseCard';
import { ActivityCard } from '../evaluations/presentation/components/ActivityCard';
import { AnalyticsCard } from '../evaluations/presentation/components/AnalyticsCard';
import { CriteriaBarChart } from '../evaluations/presentation/components/CriteriaBarChart';
import { StudentTrendChart } from '../evaluations/presentation/components/StudentTrendChart';
import { useNotification } from '../notifications/presentation/context/NotificationContext';

const MetricBox = ({
  title,
  value,
  align = 'left',
}: {
  title: string;
  value: string;
  align?: 'left' | 'right';
}) => {
  const isRight = align === 'right';

  return (
    <View
      style={[
        styles.metricBox,
        isRight ? styles.metricBoxRight : styles.metricBoxLeft,
      ]}
    >
      <Text style={styles.metricTitle}>{title}</Text>
      <Text style={styles.metricValue}>{value}</Text>
    </View>
  );
};

export default function HomeScreen() {
  const theme = useTheme();
  const navigation = useNavigation<any>();

  const { user } = useAuth();
  const { courses, isLoading: isLoadingCourses, loadCoursesByUser } = useCourse();
  const {
    loadCategoriesForCourseCard,
    loadCategoriesForCourseCardByStudent,
    getCategoriesPreview,
    getCategoryCountText,
  } = useCategory();
  const {
    homeActivities,
    isLoadingHomeActivities,
    loadHomeActivitiesPreview,
    getActivityUIData,
    getTeacherActivityUIData,
  } = useEvaluation();
  const {
    studentHomeTrend,
    studentAverageMetric,
    studentPendingMetric,
    isLoadingStudentHomeAnalytics,
    loadStudentHomeAnalytics,
    teacherHomeCompletionTrend,
    teacherActiveActivitiesMetric,
    teacherPendingGroupsMetric,
    isLoadingTeacherHomeAnalytics,
    loadTeacherHomeAnalytics,
  } = useEvaluationAnalytics();

  const [refreshing, setRefreshing] = useState(false);
  const [isCascadeLoading, setIsCascadeLoading] = useState(false);

  const isTeacher = user?.role === 'teacher';
  const { unreadCount } = useNotification();

  useEffect(() => {
    const fetchDependencies = async () => {
      if (courses.length === 0) return;

      setIsCascadeLoading(true);

      try {
        const catIds: string[] = [];

        for (const course of courses) {
          if (isTeacher) {
            await loadCategoriesForCourseCard(course.id);
          } else {
            await loadCategoriesForCourseCardByStudent(course.id);
          }

          const cats = getCategoriesPreview(course.id);
          cats.forEach((c) => catIds.push(c.id));
        }

        if (catIds.length > 0) {
          await loadHomeActivitiesPreview(catIds);
        }
      } catch (error) {
        console.error('Error en cascada de Home:', error);
      } finally {
        setIsCascadeLoading(false);
      }
    };

    fetchDependencies();
  }, [courses, isTeacher]);

  useEffect(() => {
    if (isTeacher) {
      loadTeacherHomeAnalytics();
    } else {
      loadStudentHomeAnalytics();
    }
  }, [isTeacher]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadCoursesByUser();

    if (isTeacher) {
      await loadTeacherHomeAnalytics();
    } else {
      await loadStudentHomeAnalytics();
    }

    setRefreshing(false);
  }, [loadCoursesByUser, isTeacher, loadTeacherHomeAnalytics, loadStudentHomeAnalytics]);

  const recentCourses = [...courses].reverse().slice(0, 2);
  const isAnyLoading =
    isLoadingCourses ||
    isLoadingHomeActivities ||
    isCascadeLoading ||
    isLoadingTeacherHomeAnalytics ||
    isLoadingStudentHomeAnalytics;

  const hasContent = recentCourses.length > 0 || homeActivities.length > 0;

  const getStudentStatusLabel = () => {
    if (!studentAverageMetric?.value) return 'Sin dato';

    const avg = parseFloat(studentAverageMetric.value);

    if (Number.isNaN(avg)) return 'Sin dato';
    if (avg < 2.0) return 'Deficiente';
    if (avg < 3.0) return 'Regular';
    if (avg < 4.0) return 'Bien';
    if (avg < 4.5) return 'Muy Bien';
    return 'Excelente';
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
          />
        }
      >
        <View style={styles.headerRow}>
          <View>
            <Text
              variant="titleMedium"
              style={{ color: theme.colors.primary, fontWeight: 'bold' }}
            >
              Home
            </Text>
            <Text
              variant="headlineSmall"
              style={{
                color: isTeacher ? theme.colors.secondary : theme.colors.primary,
                fontWeight: '900',
              }}
            >
              Contenido Reciente
            </Text>
          </View>

          <View>
            <IconButton
              icon="bell-outline"
              iconColor={theme.colors.onBackground}
              size={28}
              onPress={() => navigation.getParent()?.navigate('Notifications')}
            />
            {unreadCount > 0 && (
              <Badge style={[styles.badge, { backgroundColor: theme.colors.error }]}>
                {unreadCount}
              </Badge>
            )}
          </View>
        </View>

        {isTeacher ? (
          <AnalyticsCard
            title="Progreso del curso"
            subtitle="Completitud de actividades recientes"
            chart={
              isLoadingTeacherHomeAnalytics ? (
                <ActivityIndicator
                  size="small"
                  color={theme.colors.primary}
                  style={{ height: 180 }}
                />
              ) : (
                <CriteriaBarChart data={teacherHomeCompletionTrend} />
              )
            }
            footer={
              <View style={styles.metricsRow}>
                <MetricBox
                  title={teacherActiveActivitiesMetric?.title || 'ACTIVAS'}
                  value={teacherActiveActivitiesMetric?.value || '0'}
                  align="left"
                />
                <MetricBox
                  title={teacherPendingGroupsMetric?.title || 'GRUPOS PENDIENTES'}
                  value={teacherPendingGroupsMetric?.value || '0'}
                  align="right"
                />
              </View>
            }
          />
        ) : (
          <AnalyticsCard
            title="Mis resultados"
            subtitle="Evaluación reciente"
            trailing={
              <View style={styles.statusTag}>
                <Text style={styles.statusTagText}>
                  Estado: {getStudentStatusLabel()}
                </Text>
              </View>
            }
            chart={
              isLoadingStudentHomeAnalytics ? (
                <ActivityIndicator
                  size="small"
                  color={theme.colors.primary}
                  style={{ height: 180 }}
                />
              ) : (
                <StudentTrendChart data={studentHomeTrend} />
              )
            }
            footer={
              <View style={styles.metricsRow}>
                <MetricBox
                  title={studentAverageMetric?.title || 'PROMEDIO GENERAL'}
                  value={studentAverageMetric?.value || '0.0'}
                  align="left"
                />
                <MetricBox
                  title={studentPendingMetric?.title || 'PENDIENTES'}
                  value={studentPendingMetric?.value || '0'}
                  align="right"
                />
              </View>
            }
          />
        )}

        {isAnyLoading && !hasContent && (
          <ActivityIndicator
            size="large"
            color={theme.colors.primary}
            style={styles.loader}
          />
        )}

        {!isAnyLoading && !hasContent && (
          <View style={styles.emptyContainer}>
            <Text
              variant="titleMedium"
              style={[styles.emptyText, { color: theme.colors.onSurfaceVariant }]}
            >
              Actualmente no hay nada para mostrar
            </Text>
          </View>
        )}

        {homeActivities.length > 0 && (
          <View style={styles.section}>
            <Text
              variant="titleMedium"
              style={[styles.sectionTitle, { color: theme.colors.primary }]}
            >
              Actividades Agregadas
            </Text>

            {homeActivities.map((activity) => {
              const uiData = isTeacher
                ? getTeacherActivityUIData(activity)
                : getActivityUIData(activity);

              const dateBgColor = uiData.isExpired
                ? theme.colors.surfaceVariant
                : theme.colors.primaryContainer;

              const dateTextColor = uiData.isExpired
                ? theme.colors.onSurfaceVariant
                : theme.colors.primary;

              return (
                <View key={activity.id} style={{ marginBottom: 16 }}>
                  <ActivityCard
                    title={activity.name}
                    month={uiData.month}
                    day={uiData.day}
                    statusTag={isTeacher ? uiData.statusTag : uiData.statusLabel}
                    statusDetail={uiData.statusDetail}
                    dateBgColor={dateBgColor}
                    dateTextColor={dateTextColor}
                    onTap={() => {
                      if (isTeacher) {
                        navigation.navigate('TeacherReport', {
                          activityId: activity.id,
                          activityName: activity.name,
                          categoryId: activity.categoryId,
                        });
                      } else {
                        navigation.navigate('StudentEvaluation', {
                          activityId: activity.id,
                          activityName: activity.name,
                          categoryId: activity.categoryId,
                          visibility: activity.visibility,
                          isExpired: uiData.isExpired,
                        });
                      }
                    }}
                  />
                </View>
              );
            })}
          </View>
        )}

        {recentCourses.length > 0 && (
          <View style={styles.section}>
            <Text
              variant="titleMedium"
              style={[styles.sectionTitle, { color: theme.colors.primary }]}
            >
              Cursos Agregados
            </Text>

            <View style={styles.coursesRow}>
              {recentCourses.map((course, index) => (
                <View
                  key={course.id}
                  style={[
                    styles.courseWrapper,
                    index === 0 && recentCourses.length > 1 && { paddingRight: 8 },
                    index === 1 && { paddingLeft: 8 },
                  ]}
                >
                  <HomeCourseCard
                    title={course.name}
                    subtitle={getCategoryCountText(course.id)}
                    onTap={() => {
                      if (isTeacher) {
                        navigation.navigate('TeacherCourseDetail', {
                          courseId: course.id,
                          courseTitle: course.name,
                        });
                      } else {
                        navigation.navigate('StudentCourseDetail', {
                          courseId: course.id,
                          courseTitle: course.name,
                        });
                      }
                    }}
                  />
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 20, paddingTop: 50, paddingBottom: 40 },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  badge: {
    position: 'absolute',
    top: 6,
    right: 8,
  },
  loader: {
    marginVertical: 40,
  },
  emptyContainer: {
    height: 250,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    textAlign: 'center',
    fontWeight: 'bold',
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 16,
  },
  coursesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  courseWrapper: {
    flex: 1,
  },
  statusTag: {
    backgroundColor: '#E9DDFC',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    alignSelf: 'flex-start',
    marginTop: 2,
  },
  statusTagText: {
    color: '#7C4DCC',
    fontWeight: '700',
    fontSize: 13,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    width: '100%',
    paddingHorizontal: 2,
    marginTop: 6,
  },
  metricBox: {
    flex: 1,
  },
  metricBoxLeft: {
    alignItems: 'flex-start',
  },
  metricBoxRight: {
    alignItems: 'flex-end',
  },
  metricTitle: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    color: '#9A95B8',
    marginBottom: 8,
  },
  metricValue: {
    fontSize: 26,
    fontWeight: '800',
    color: '#201547',
    lineHeight: 30,
  },
});