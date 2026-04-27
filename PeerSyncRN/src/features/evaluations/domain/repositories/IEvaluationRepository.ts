import { Activity } from '../entities/Activity';
import { GroupReport } from '../entities/ActivityReport';
import { Peer } from '../entities/Peer';
import { Criteria } from '../entities/Criteria';

export interface IEvaluationRepository {
  createActivity(
    categoryId: string,
    name: string,
    description: string,
    startDate: Date,
    endDate: Date,
    visibility: boolean
  ): Promise<void>;

  getActivitiesByCategory(categoryId: string): Promise<Activity[]>;
  
  // Reemplazamos los List<dynamic> por sus tipos reales
  getPeers(categoryId: string, studentEmail: string): Promise<Peer[]>;
  getCriteria(activityId: string): Promise<Criteria[]>;
  
  // Map<String, Map<String, double>> pasa a Record<string, Record<string, number>>
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