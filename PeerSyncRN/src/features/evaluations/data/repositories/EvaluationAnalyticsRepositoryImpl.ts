import { IEvaluationAnalyticsRepository } from '../../domain/repositories/IEvaluationAnalyticsRepository';

import { ChartPoint } from '../../domain/entities/ChartPoint';
import { DashboardMetric } from '../../domain/entities/DashboardMetric';
import { IEvaluationAnalyticsRemoteSource } from '../datasources/IEvaluationAnalyticsRemoteSource';

export class EvaluationAnalyticsRepositoryImpl implements IEvaluationAnalyticsRepository {
  constructor(private remoteSource: IEvaluationAnalyticsRemoteSource) {}

  async getStudentHomeTrend(myEmail: string): Promise<ChartPoint[]> {
    return this.remoteSource.getStudentHomeTrend(myEmail);
  }

  async getStudentCategoryCriteriaAverages(categoryId: string, myEmail: string): Promise<ChartPoint[]> {
    return this.remoteSource.getStudentCategoryCriteriaAverages(categoryId, myEmail);
  }

  async getTeacherHomeCompletionTrend(): Promise<ChartPoint[]> {
    return this.remoteSource.getTeacherHomeCompletionTrend();
  }

  async getTeacherCategoryCriteriaAverages(categoryId: string): Promise<ChartPoint[]> {
    return this.remoteSource.getTeacherCategoryCriteriaAverages(categoryId);
  }

  async getStudentAverageMetric(myEmail: string): Promise<DashboardMetric> {
    return this.remoteSource.getStudentAverageMetric(myEmail);
  }

  async getStudentPendingMetric(myEmail: string): Promise<DashboardMetric> {
    return this.remoteSource.getStudentPendingMetric(myEmail);
  }

  async getTeacherActiveActivitiesMetric(): Promise<DashboardMetric> {
    return this.remoteSource.getTeacherActiveActivitiesMetric();
  }

  async getTeacherPendingGroupsMetric(): Promise<DashboardMetric> {
    return this.remoteSource.getTeacherPendingGroupsMetric();
  }
}