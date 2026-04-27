import { IEvaluationRepository } from '../../domain/repositories/IEvaluationRepository';
import { IEvaluationRemoteSource } from '../datasources/IEvaluationRemoteSource';
import { ILocalPreferences } from '../../../../core/iLocalPreferences';

import { Activity } from '../../domain/entities/Activity';
import { Peer } from '../../domain/entities/Peer';
import { Criteria } from '../../domain/entities/Criteria';
import { GroupReport } from '../../domain/entities/ActivityReport';

export class EvaluationRepositoryImpl implements IEvaluationRepository {
  constructor(
    private remoteSource: IEvaluationRemoteSource,
    private localPreferences: ILocalPreferences
  ) {}

  async createActivity(
    categoryId: string,
    name: string,
    description: string | null,
    startDate: Date,
    endDate: Date,
    visibility: boolean
  ): Promise<void> {
    await this.remoteSource.createActivity(
      categoryId,
      name,
      description,
      startDate,
      endDate,
      visibility
    );
  }

  async getActivitiesByCategory(categoryId: string): Promise<Activity[]> {
    const cacheKey = `activities_${categoryId}`;
    const cacheTimeKey = `activities_time_${categoryId}`;

    const cachedData = await this.localPreferences.retrieveData<any[]>(cacheKey);
    const cacheTime = await this.localPreferences.retrieveData<number>(cacheTimeKey);

    const now = Date.now();
    const cacheDuration = 1 * 60 * 1000; // ⏱ 1 minuto

    // 🔥 SI HAY CACHE Y MARCA DE TIEMPO
    if (cachedData && cacheTime) {
      const isFresh = (now - cacheTime) < cacheDuration;

      console.log(`📦 CACHE encontrada (${cacheKey})`);
      console.log(`⏱ Cache fresca: ${isFresh}`);

      if (isFresh) {
        console.log('⚡ USANDO CACHE FRESCA (activities)');
        return this.mapToActivities(cachedData);
      }

      console.log('🟡 CACHE VIEJA → REFRESH EN BACKGROUND');
      // Refresca en segundo plano sin bloquear el retorno actual
      this._refreshActivitiesInBackground(categoryId, cacheKey, cacheTimeKey);

      return this.mapToActivities(cachedData);
    }

    // 🌐 NO HAY CACHE → LLAMAR API
    console.log('🌐 GET ACTIVITIES BY CATEGORY → API');
    const rawData = await this.remoteSource.getActivitiesByCategory(categoryId);

    // 💾 GUARDAR CACHE Y TIEMPO
    await this.localPreferences.storeData<any[]>(cacheKey, rawData);
    await this.localPreferences.storeData<number>(cacheTimeKey, now);

    console.log(`💾 CACHE SAVED (${cacheKey})`);

    return this.mapToActivities(rawData);
  }

  private async _refreshActivitiesInBackground(
    categoryId: string,
    cacheKey: string,
    cacheTimeKey: string
  ): Promise<void> {
    try {
      console.log('🔄 REFRESH ACTIVITIES EN BACKGROUND');
      const data = await this.remoteSource.getActivitiesByCategory(categoryId);

      await this.localPreferences.storeData<any[]>(cacheKey, data);
      await this.localPreferences.storeData<number>(cacheTimeKey, Date.now());

      console.log('✅ CACHE ACTUALIZADA (activities)');
    } catch (e) {
      console.log(`⚠️ ERROR REFRESH ACTIVITIES: ${e}`);
    }
  }

  // --- MÉTODOS DIRECTOS (Passthrough con mapeo de entidades) ---

  async getPeers(categoryId: string, studentEmail: string): Promise<Peer[]> {
    const data = await this.remoteSource.getPeers(categoryId, studentEmail);
    return data.map((j) => ({
      email: String(j.email),
      firstName: String(j.first_name),
      lastName: String(j.last_name),
    }));
  }

  async getCriteria(activityId: string): Promise<Criteria[]> {
    const data = await this.remoteSource.getCriteria(activityId);
    return data.map((j) => ({
      id: String(j._id),
      activityId: String(j.activity_id),
      name: String(j.name),
      description: j.description ? String(j.description) : undefined,
      maxScore: parseFloat(j.max_score) || 5.0,
    }));
  }

  async getMyEvaluations(activityId: string, myEmail: string): Promise<Record<string, Record<string, number>>> {
    return await this.remoteSource.getMyEvaluations(activityId, myEmail);
  }

  async submitEvaluation(
    activityId: string,
    categoryId: string,
    evaluatorEmail: string,
    evaluatedEmail: string,
    comments: string,
    scores: Record<string, number>
  ): Promise<void> {
    await this.remoteSource.submitEvaluation(
      activityId,
      categoryId,
      evaluatorEmail,
      evaluatedEmail,
      comments,
      scores
    );
  }

  async getMyAverageResults(activityId: string, myEmail: string): Promise<Record<string, number>> {
    return await this.remoteSource.getMyAverageResults(activityId, myEmail);
  }

  async getActivityReport(activityId: string, categoryId: string): Promise<GroupReport[]> {
    return await this.remoteSource.getActivityReport(activityId, categoryId);
  }

  // --- UTILIDADES ---
  
  private mapToActivities(rawData: any[]): Activity[] {
    return rawData.map((json) => ({
      id: String(json._id),
      categoryId: String(json.category_id),
      name: String(json.name),
      description: json.description ? String(json.description) : undefined,
      startDate: new Date(json.start_date),
      endDate: new Date(json.end_date),
      visibility: json.visibility ?? false,
    }));
  }
}