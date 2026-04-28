import React, { useEffect, useCallback, useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Text, useTheme, IconButton, Badge, Surface } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';

// Contextos
import { useAuth } from '../auth/presentation/context/authContext';
import { useCourse } from '../courses/presentation/context/CourseContext';
import { useCategory } from '../categories/presentation/context/CategoryContext';
import { useEvaluation } from '../evaluations/presentation/context/EvaluationContext';
import { useEvaluationAnalytics } from '../evaluations/presentation/context/EvaluationAnalyticsContext';

// Componentes
import { HomeCourseCard } from './components/HomeCourseCard';
import { ActivityCard } from '../evaluations/presentation/components/ActivityCard';
import { AnalyticsCard } from '../evaluations/presentation/components/AnalyticsCard';
import { CriteriaBarChart } from '../evaluations/presentation/components/CriteriaBarChart';

import { StudentTrendChart } from '../evaluations/presentation/components/StudentTrendChart'; 
import { useNotification } from '../notifications/presentation/context/NotificationContext';

// --- Subcomponente para las métricas del Footer (Equivalente al MetricBox de Flutter) ---
const MetricBox = ({ title, value }: { title: string; value: string }) => {
  const theme = useTheme();
  return (
    <View style={styles.metricBox}>
      <Text style={[styles.metricTitle, { color: theme.colors.onSurfaceVariant }]}>{title}</Text>
      <Text style={[styles.metricValue, { color: theme.colors.primary }]}>{value}</Text>
    </View>
  );
};

export default function HomeScreen() {
  const theme = useTheme();
  const navigation = useNavigation<any>();
  
  // 1. Contextos
  const { user } = useAuth();
  const { courses, isLoading: isLoadingCourses, loadCoursesByUser } = useCourse();
  const { 
    loadCategoriesForCourseCard, 
    loadCategoriesForCourseCardByStudent, 
    getCategoriesPreview, 
    getCategoryCountText 
  } = useCategory();
  const { 
    homeActivities, 
    isLoadingHomeActivities, 
    loadHomeActivitiesPreview, 
    getActivityUIData, 
    getTeacherActivityUIData 
  } = useEvaluation();
  const {
    studentHomeTrend, studentAverageMetric, studentPendingMetric, isLoadingStudentHomeAnalytics, loadStudentHomeAnalytics,
    teacherHomeCompletionTrend, teacherActiveActivitiesMetric, teacherPendingGroupsMetric, isLoadingTeacherHomeAnalytics, loadTeacherHomeAnalytics
  } = useEvaluationAnalytics();

  // 2. Estados locales
  const [refreshing, setRefreshing] = useState(false);
  const [isCascadeLoading, setIsCascadeLoading] = useState(false);
  
  // Determinar rol (Ajusta el 'teacher' según cómo lo guardes en base de datos)
  const isTeacher = user?.role === 'teacher';

  // 3. Efecto de cascada para cargar datos (Equivalente al _loadHomeDataGlobal de Flutter)
  useEffect(() => {
    const fetchDependencies = async () => {
      if (courses.length === 0) return;
      
      setIsCascadeLoading(true);
      try {
        const catIds: string[] = [];
        
        for (const course of courses) {
          // Cargamos categorías según el rol
          if (isTeacher) {
            await loadCategoriesForCourseCard(course.id);
          } else {
            await loadCategoriesForCourseCardByStudent(course.id);
          }
          
          // Extraemos los IDs de las categorías para buscar sus actividades
          const cats = getCategoriesPreview(course.id);
          cats.forEach(c => catIds.push(c.id));
        }

        if (catIds.length > 0) {
          await loadHomeActivitiesPreview(catIds);
        }
      } catch (error) {
        console.error("Error en cascada de Home:", error);
      } finally {
        setIsCascadeLoading(false);
      }
    };

    fetchDependencies();
  }, [courses, isTeacher]); // Se ejecuta cada vez que 'courses' se actualiza

  // 4. Efecto independiente para Analíticas
  useEffect(() => {
    if (isTeacher) {
      loadTeacherHomeAnalytics();
    } else {
      loadStudentHomeAnalytics();
    }
  }, [isTeacher]);

  // 5. Pull to Refresh manual
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadCoursesByUser(); // Esto actualizará 'courses' y disparará el useEffect de cascada
    if (isTeacher) {
      await loadTeacherHomeAnalytics();
    } else {
      await loadStudentHomeAnalytics();
    }
    setRefreshing(false);
  }, [loadCoursesByUser, isTeacher, loadTeacherHomeAnalytics, loadStudentHomeAnalytics]);

  // 6. Preparación de variables UI
  const recentCourses = [...courses].reverse().slice(0, 2);
  const isAnyLoading = isLoadingCourses || isLoadingHomeActivities || isCascadeLoading || isLoadingTeacherHomeAnalytics || isLoadingStudentHomeAnalytics;
  const hasContent = recentCourses.length > 0 || homeActivities.length > 0;
  const { unreadCount } = useNotification();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.primary]} />}
      >
        {/* ENCABEZADO */}
        <View style={styles.headerRow}>
          <View>
            <Text variant="titleMedium" style={{ color: theme.colors.primary, fontWeight: 'bold' }}>
              Home
            </Text>
            <Text variant="headlineSmall" style={{ color: isTeacher ? theme.colors.secondary : theme.colors.primary, fontWeight: '900' }}>
              Contenido Reciente
            </Text>
          </View>
          
          <View>
            <IconButton 
              icon="bell-outline" 
              iconColor={theme.colors.onBackground} 
              size={28} 
              onPress={() => navigation.navigate('Notifications')}
            />
            {unreadCount > 0 && (
              <Badge style={[styles.badge, { backgroundColor: theme.colors.error }]}>
                {unreadCount}
              </Badge>
            )}
          </View>
        </View>

        {/* ANALÍTICAS (Diferenciada por rol) */}
        {isTeacher ? (
          <AnalyticsCard
            title="Progreso del curso"
            subtitle="Completitud de actividades recientes"
            chart={
              isLoadingTeacherHomeAnalytics ? (
                <ActivityIndicator size="small" color={theme.colors.primary} style={{ height: 180 }} />
              ) : (
                <CriteriaBarChart data={teacherHomeCompletionTrend} />
              )
            }
            footer={
              <View style={styles.footerRow}>
                <MetricBox title={teacherActiveActivitiesMetric?.title || 'Activas'} value={teacherActiveActivitiesMetric?.value || '0'} />
                <MetricBox title={teacherPendingGroupsMetric?.title || 'Pendientes'} value={teacherPendingGroupsMetric?.value || '0'} />
              </View>
            }
          />
        ) : (
          <AnalyticsCard
            title="Mis resultados"
            subtitle="Evaluación reciente"
            chart={
              isLoadingStudentHomeAnalytics ? (
                <ActivityIndicator size="small" color={theme.colors.primary} style={{ height: 180 }} />
              ) : (
                <StudentTrendChart data={studentHomeTrend} />
              )
            }
            footer={
              <View style={styles.footerRow}>
                <MetricBox title={studentAverageMetric?.title || 'Promedio'} value={studentAverageMetric?.value || '0.0'} />
                <MetricBox title={studentPendingMetric?.title || 'Pendientes'} value={studentPendingMetric?.value || '0'} />
              </View>
            }
          />
        )}

        {/* LOADING & EMPTY STATES */}
        {isAnyLoading && !hasContent && (
          <ActivityIndicator size="large" color={theme.colors.primary} style={styles.loader} />
        )}

        {!isAnyLoading && !hasContent && (
          <View style={styles.emptyContainer}>
            <Text variant="titleMedium" style={[styles.emptyText, { color: theme.colors.onSurfaceVariant }]}>
              Actualmente no hay nada para mostrar
            </Text>
          </View>
        )}

        {/* ACTIVIDADES RECIENTES */}
        {homeActivities.length > 0 && (
          <View style={styles.section}>
            <Text variant="titleMedium" style={[styles.sectionTitle, { color: isTeacher ? theme.colors.secondary : theme.colors.onBackground }]}>
              Actividades Agregadas
            </Text>
            {homeActivities.map((activity) => {
              // Obtenemos los datos formateados de UI según el rol
              const uiData = isTeacher ? getTeacherActivityUIData(activity) : getActivityUIData(activity);
              
              // Colores dinámicos para la tarjeta de fecha si está vencida
              const dateBgColor = uiData.isExpired ? theme.colors.surfaceVariant : theme.colors.primaryContainer;
              const dateTextColor = uiData.isExpired ? theme.colors.onSurfaceVariant : theme.colors.primary;

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
                        navigation.navigate('TeacherReport', { activityId: activity.id, activityName: activity.name, categoryId: activity.categoryId });
                      } else {
                        navigation.navigate('StudentEvaluation', { activityId: activity.id, activityName: activity.name, categoryId: activity.categoryId, visibility: activity.visibility, isExpired: uiData.isExpired });
                      }
                    }}
                  />
                </View>
              );
            })}
          </View>
        )}

        {/* CURSOS RECIENTES */}
        {recentCourses.length > 0 && (
          <View style={styles.section}>
            <Text variant="titleMedium" style={[styles.sectionTitle, { color: isTeacher ? theme.colors.secondary : theme.colors.onBackground }]}>
              Cursos Agregados
            </Text>
            <View style={styles.coursesRow}>
              {recentCourses.map((course, index) => (
                <View 
                  key={course.id} 
                  style={[styles.courseWrapper, index === 0 && recentCourses.length > 1 && { paddingRight: 8 }, index === 1 && { paddingLeft: 8 }]}
                >
                  <HomeCourseCard
                    title={course.name}
                    subtitle={getCategoryCountText(course.id)}
                    onTap={() => {
                      if (isTeacher) {
                        navigation.navigate('TeacherCourseDetail', { courseId: course.id, courseTitle: course.name });
                      } else {
                        navigation.navigate('StudentCourseDetail', { courseId: course.id, courseTitle: course.name });
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
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  badge: { position: 'absolute', top: 6, right: 8 },
  loader: { marginVertical: 40 },
  emptyContainer: { height: 250, justifyContent: 'center', alignItems: 'center' },
  emptyText: { textAlign: 'center', fontWeight: 'bold' },
  section: { marginTop: 24 },
  sectionTitle: { fontWeight: 'bold', marginBottom: 16 },
  coursesRow: { flexDirection: 'row', justifyContent: 'space-between' },
  courseWrapper: { flex: 1 },
  footerRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', paddingHorizontal: 10 },
  metricBox: { alignItems: 'center', flex: 1 },
  metricTitle: { fontSize: 12, marginBottom: 4 },
  metricValue: { fontSize: 24, fontWeight: 'bold' },
});