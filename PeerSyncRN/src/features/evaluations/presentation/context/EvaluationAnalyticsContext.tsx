import React, { createContext, useContext, useState, useCallback } from 'react';
import { ChartPoint } from '../../domain/entities/ChartPoint';
import { DashboardMetric } from '../../domain/entities/DashboardMetric';
import { IEvaluationAnalyticsRepository } from '../../domain/repositories/IEvaluationAnalyticsRepository';
import { useDI } from '../../../../core/di/DIProvider';
import { TOKENS } from '../../../../core/di/tokens';

import { showAlert } from '../../../../core/utils/alerts';
import { useAuth } from '@/src/features/auth/presentation/context/authContext';

interface EvaluationAnalyticsContextProps {
  // Estados para Estudiantes
  studentHomeTrend: ChartPoint[];
  studentCategoryCriteriaChart: ChartPoint[];
  studentAverageMetric: DashboardMetric | null;
  studentPendingMetric: DashboardMetric | null;
  isLoadingStudentHomeAnalytics: boolean;
  isLoadingStudentCategoryAnalytics: boolean;

  // Estados para Profesores
  teacherHomeCompletionTrend: ChartPoint[];
  teacherCategoryCriteriaChart: ChartPoint[];
  teacherActiveActivitiesMetric: DashboardMetric | null;
  teacherPendingGroupsMetric: DashboardMetric | null;
  isLoadingTeacherHomeAnalytics: boolean;
  isLoadingTeacherCategoryAnalytics: boolean;

  // Acciones Estudiante
  loadStudentHomeAnalytics: () => Promise<void>;
  loadStudentCategoryAnalytics: (categoryId: string) => Promise<void>;

  // Acciones Profesor
  loadTeacherHomeAnalytics: () => Promise<void>;
  loadTeacherCategoryAnalytics: (categoryId: string) => Promise<void>;
}

const EvaluationAnalyticsContext = createContext<EvaluationAnalyticsContextProps | undefined>(undefined);

export const EvaluationAnalyticsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const container = useDI();
  const repository = container.resolve<IEvaluationAnalyticsRepository>(TOKENS.EvaluationAnalyticsRepo);
  const { user } = useAuth(); // Para obtener el correo actual

  // ================= ESTADOS ESTUDIANTE =================
  const [studentHomeTrend, setStudentHomeTrend] = useState<ChartPoint[]>([]);
  const [studentCategoryCriteriaChart, setStudentCategoryCriteriaChart] = useState<ChartPoint[]>([]);
  const [studentAverageMetric, setStudentAverageMetric] = useState<DashboardMetric | null>(null);
  const [studentPendingMetric, setStudentPendingMetric] = useState<DashboardMetric | null>(null);
  
  const [isLoadingStudentHomeAnalytics, setIsLoadingStudentHomeAnalytics] = useState(false);
  const [isLoadingStudentCategoryAnalytics, setIsLoadingStudentCategoryAnalytics] = useState(false);

  // ================= ESTADOS PROFESOR =================
  const [teacherHomeCompletionTrend, setTeacherHomeCompletionTrend] = useState<ChartPoint[]>([]);
  const [teacherCategoryCriteriaChart, setTeacherCategoryCriteriaChart] = useState<ChartPoint[]>([]);
  const [teacherActiveActivitiesMetric, setTeacherActiveActivitiesMetric] = useState<DashboardMetric | null>(null);
  const [teacherPendingGroupsMetric, setTeacherPendingGroupsMetric] = useState<DashboardMetric | null>(null);

  const [isLoadingTeacherHomeAnalytics, setIsLoadingTeacherHomeAnalytics] = useState(false);
  const [isLoadingTeacherCategoryAnalytics, setIsLoadingTeacherCategoryAnalytics] = useState(false);

  // ================= LÓGICA ESTUDIANTE =================
  const loadStudentHomeAnalytics = useCallback(async () => {
    try {
      setIsLoadingStudentHomeAnalytics(true);
      const myEmail = user?.email || '';

      if (!myEmail) {
        setStudentHomeTrend([]);
        setStudentAverageMetric(null);
        setStudentPendingMetric(null);
        return;
      }

      const trend = await repository.getStudentHomeTrend(myEmail);
      const average = await repository.getStudentAverageMetric(myEmail);
      const pending = await repository.getStudentPendingMetric(myEmail);

      setStudentHomeTrend(trend);
      setStudentAverageMetric(average);
      setStudentPendingMetric(pending);
    } catch (e: any) {
      showAlert('Error', `No se pudieron cargar las analíticas: ${e.message}`);
    } finally {
      setIsLoadingStudentHomeAnalytics(false);
    }
  }, [repository, user?.email]);

  const loadStudentCategoryAnalytics = useCallback(async (categoryId: string) => {
    try {
      setIsLoadingStudentCategoryAnalytics(true);
      const myEmail = user?.email || '';

      if (!myEmail) {
        setStudentCategoryCriteriaChart([]);
        return;
      }

      const result = await repository.getStudentCategoryCriteriaAverages(categoryId, myEmail);
      setStudentCategoryCriteriaChart(result);
    } catch (e: any) {
      showAlert('Error', `No se pudo cargar la analítica de la categoría: ${e.message}`);
    } finally {
      setIsLoadingStudentCategoryAnalytics(false);
    }
  }, [repository, user?.email]);

  // ================= LÓGICA PROFESOR =================
  const loadTeacherHomeAnalytics = useCallback(async () => {
    try {
      setIsLoadingTeacherHomeAnalytics(true);

      const trend = await repository.getTeacherHomeCompletionTrend();
      const active = await repository.getTeacherActiveActivitiesMetric();
      const pending = await repository.getTeacherPendingGroupsMetric();

      setTeacherHomeCompletionTrend(trend);
      setTeacherActiveActivitiesMetric(active);
      setTeacherPendingGroupsMetric(pending);
    } catch (e: any) {
      showAlert('Error', `No se pudieron cargar las analíticas del profesor: ${e.message}`);
    } finally {
      setIsLoadingTeacherHomeAnalytics(false);
    }
  }, [repository]);

  const loadTeacherCategoryAnalytics = useCallback(async (categoryId: string) => {
    try {
      setIsLoadingTeacherCategoryAnalytics(true);

      const result = await repository.getTeacherCategoryCriteriaAverages(categoryId);
      setTeacherCategoryCriteriaChart(result);
    } catch (e: any) {
      showAlert('Error', `No se pudo cargar la analítica de la categoría: ${e.message}`);
    } finally {
      setIsLoadingTeacherCategoryAnalytics(false);
    }
  }, [repository]);

  return (
    <EvaluationAnalyticsContext.Provider
      value={{
        studentHomeTrend,
        studentCategoryCriteriaChart,
        studentAverageMetric,
        studentPendingMetric,
        isLoadingStudentHomeAnalytics,
        isLoadingStudentCategoryAnalytics,
        
        teacherHomeCompletionTrend,
        teacherCategoryCriteriaChart,
        teacherActiveActivitiesMetric,
        teacherPendingGroupsMetric,
        isLoadingTeacherHomeAnalytics,
        isLoadingTeacherCategoryAnalytics,

        loadStudentHomeAnalytics,
        loadStudentCategoryAnalytics,
        loadTeacherHomeAnalytics,
        loadTeacherCategoryAnalytics,
      }}
    >
      {children}
    </EvaluationAnalyticsContext.Provider>
  );
};

export const useEvaluationAnalytics = (): EvaluationAnalyticsContextProps => {
  const context = useContext(EvaluationAnalyticsContext);
  if (!context) throw new Error('useEvaluationAnalytics debe usarse dentro de un EvaluationAnalyticsProvider');
  return context;
};