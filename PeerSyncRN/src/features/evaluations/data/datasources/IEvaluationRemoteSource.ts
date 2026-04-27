import { GroupReport } from '../../domain/entities/ActivityReport';

export interface IEvaluationRemoteSource {
  createActivity(
    categoryId: string,
    name: string,
    description: string | null,
    startDate: Date,
    endDate: Date,
    visibility: boolean
  ): Promise<void>;

  getActivitiesByCategory(categoryId: string): Promise<Record<string, any>[]>;
  
  getPeers(categoryId: string, studentEmail: string): Promise<Record<string, any>[]>;
  
  getCriteria(activityId: string): Promise<Record<string, any>[]>;
  
  getMyEvaluations(activityId: string, myEmail: string): Promise<Record<string, Record<string, number>>>;
  
  submitEvaluation(
    activityId: string,
    categoryId: string,
    evaluatorEmail: string,
    evaluatedEmail: string,
    comments: string,
    scores: Record<string, number>
  ): Promise<void>;
  
  getMyAverageResults(activityId: string, myEmail: string): Promise<Record<string, number>>;
  
  getActivityReport(activityId: string, categoryId: string): Promise<GroupReport[]>;
}