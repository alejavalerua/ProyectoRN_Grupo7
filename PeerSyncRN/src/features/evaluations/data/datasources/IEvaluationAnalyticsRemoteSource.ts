import { ChartPoint } from '../../domain/entities/ChartPoint';
import { DashboardMetric } from '../../domain/entities/DashboardMetric';

export interface IEvaluationAnalyticsRemoteSource {
  getStudentHomeTrend(myEmail: string): Promise<ChartPoint[]>;
  
  getStudentCategoryCriteriaAverages(
    categoryId: string, 
    myEmail: string
  ): Promise<ChartPoint[]>;
  
  getTeacherHomeCompletionTrend(): Promise<ChartPoint[]>;
  
  getTeacherCategoryCriteriaAverages(categoryId: string): Promise<ChartPoint[]>;
  
  getStudentAverageMetric(myEmail: string): Promise<DashboardMetric>;
  
  getStudentPendingMetric(myEmail: string): Promise<DashboardMetric>;
  
  getTeacherActiveActivitiesMetric(): Promise<DashboardMetric>;
  
  getTeacherPendingGroupsMetric(): Promise<DashboardMetric>;
}