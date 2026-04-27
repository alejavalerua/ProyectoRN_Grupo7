import { IEvaluationAnalyticsRemoteSource } from './IEvaluationAnalyticsRemoteSource';
import { ChartPoint } from '../../domain/entities/ChartPoint';
import { DashboardMetric } from '../../domain/entities/DashboardMetric';
import { ILocalPreferences } from '../../../../core/iLocalPreferences';

export class EvaluationAnalyticsRemoteSourceImpl implements IEvaluationAnalyticsRemoteSource {
  private dbUrl = 'https://roble-api.openlab.uninorte.edu.co/database/peer_sync_2e18809588';

  constructor(private localPreferences: ILocalPreferences) {}

  private async getHeaders(): Promise<HeadersInit> {
    const token = await this.localPreferences.retrieveData<string>('tokenA');
    if (!token) throw new Error('No hay sesión activa.');
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };
  }

  private async readTable(tableName: string, queryParams: Record<string, string> = {}): Promise<any[]> {
    const headers = await this.getHeaders();
    const url = new URL(`${this.dbUrl}/read`);
    url.searchParams.append('tableName', tableName);
    Object.entries(queryParams).forEach(([k, v]) => url.searchParams.append(k, v));

    const res = await fetch(url.toString(), { headers });
    if (res.ok) {
      const data = await res.json();
      return Array.isArray(data) ? data : (data?.data || data?.records || []);
    }
    return [];
  }

  private async getCurrentUserEmail(): Promise<string> {
    const email = await this.localPreferences.retrieveData<string>('email');
    return email ? email.trim() : '';
  }

  // --- HELPERS PARA TIPADO Y LÓGICA DE DART ---
  private asString(val: any): string { return val ? String(val) : ''; }
  private asDouble(val: any): number { return parseFloat(String(val)) || 0.0; }
  private asBool(val: any): boolean {
    if (typeof val === 'boolean') return val;
    const raw = String(val).toLowerCase().trim();
    return raw === 'true' || raw === '1';
  }
  private asDateTime(val: any): Date | null {
    if (!val) return null;
    const d = new Date(val);
    return isNaN(d.getTime()) ? null : d;
  }

  private shortActivityLabel(name: string): string {
    const trimmed = name.trim();
    if (!trimmed) return 'Act';
    return trimmed.length <= 10 ? trimmed : `${trimmed.substring(0, 10)}...`;
  }

  private criteriaShortLabel(name: string): string {
    const normalized = name.toLowerCase().trim();
    switch (normalized) {
      case 'puntualidad': return 'Punt.';
      case 'contribución':
      case 'contribucion': return 'Contrib.';
      case 'compromiso': return 'Comp.';
      case 'actitud': return 'Actitud';
      case 'general': return 'General';
      default: return name.length <= 10 ? name : `${name.substring(0, 10)}...`;
    }
  }

  private isOpenActivity(activity: any): boolean {
    const now = new Date();
    const start = this.asDateTime(activity.start_date);
    const end = this.asDateTime(activity.end_date);
    if (!start || !end) return false;
    return now >= start && now <= end;
  }

  // --- BÚSQUEDAS CRUZADAS (SCOPES) ---
  private async getStudentScopedActivities(myEmail: string): Promise<any[]> {
    const allActivities = await this.readTable('Activity');
    const allGroups = await this.readTable('Group');
    const allGroupMembers = await this.readTable('GroupMember');

    const myGroupIds = new Set(
      allGroupMembers.filter(m => this.asString(m.email) === myEmail).map(m => this.asString(m.group_id))
    );

    const myCategoryIds = new Set(
      allGroups.filter(g => myGroupIds.has(this.asString(g._id))).map(g => this.asString(g.category_id))
    );

    return allActivities.filter(a => 
      myCategoryIds.has(this.asString(a.category_id)) && this.asBool(a.visibility)
    );
  }

  private async getTeacherScopedActivities(): Promise<any[]> {
    const email = await this.getCurrentUserEmail();
    if (!email) return [];

    const users = await this.readTable('Users');
    const match = users.find(u => this.asString(u.email) === email);
    if (!match) return [];
    const currentUserId = this.asString(match.user_id);

    const allActivities = await this.readTable('Activity');
    const allCategories = await this.readTable('Category');
    const courseMembers = await this.readTable('CourseMember');

    const teacherCourseIds = new Set(
      courseMembers.filter(r => this.asString(r.user_id) === currentUserId).map(r => this.asString(r.course_id))
    );

    if (teacherCourseIds.size === 0) return [];

    const teacherCategoryIds = new Set(
      allCategories.filter(c => teacherCourseIds.has(this.asString(c.course_id))).map(c => this.asString(c._id))
    );

    return allActivities.filter(a => 
      teacherCategoryIds.has(this.asString(a.category_id)) && this.asBool(a.visibility)
    );
  }

  private orderCriteriaChart(valuesByName: Record<string, number>): ChartPoint[] {
    const preferredOrder = ['Puntualidad', 'Contribución', 'Contribucion', 'Compromiso', 'Actitud', 'General'];
    const ordered: ChartPoint[] = [];

    for (const criteriaName of preferredOrder) {
      if (valuesByName[criteriaName] !== undefined) {
        ordered.push({ label: this.criteriaShortLabel(criteriaName), value: valuesByName[criteriaName] });
      }
    }

    Object.entries(valuesByName).forEach(([name, value]) => {
      const label = this.criteriaShortLabel(name);
      if (!ordered.some(point => point.label === label)) {
        ordered.push({ label, value });
      }
    });

    return ordered;
  }

  // === MÉTODOS PÚBLICOS DE LA INTERFAZ ===

  async getStudentHomeTrend(myEmail: string): Promise<ChartPoint[]> {
    const scopedActivities = await this.getStudentScopedActivities(myEmail);
    const allEvaluations = await this.readTable('Evaluation');

    const activityMap: Record<string, any> = {};
    scopedActivities.forEach(a => activityMap[this.asString(a._id)] = a);

    const groupedScores: Record<string, number[]> = {};

    for (const evalRaw of allEvaluations) {
      const evaluatedId = this.asString(evalRaw.evaluated_id);
      const activityId = this.asString(evalRaw.activity_id);

      if (evaluatedId !== myEmail || !activityMap[activityId]) continue;

      if (!groupedScores[activityId]) groupedScores[activityId] = [];
      groupedScores[activityId].push(this.asDouble(evalRaw.general_score));
    }

    const points = Object.entries(groupedScores).map(([actId, scores]) => {
      const activity = activityMap[actId];
      const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
      return {
        label: this.shortActivityLabel(this.asString(activity.name)),
        value: avg,
        endDate: this.asDateTime(activity.end_date) ?? new Date(0),
      };
    });

    // Ordenar descendente para tomar los 7 más recientes y luego invertir a ascendente para el chart
    points.sort((a, b) => b.endDate.getTime() - a.endDate.getTime());
    const recent = points.slice(0, 7).sort((a, b) => a.endDate.getTime() - b.endDate.getTime());

    return recent.map(p => ({ label: p.label, value: p.value }));
  }

  async getStudentCategoryCriteriaAverages(categoryId: string, myEmail: string): Promise<ChartPoint[]> {
    const activities = await this.readTable('Activity', { category_id: categoryId });
    const visibleActivities = activities.filter(a => this.asBool(a.visibility));
    const activityIds = new Set(visibleActivities.map(a => this.asString(a._id)));

    const allEvaluations = await this.readTable('Evaluation');
    const allDetails = await this.readTable('ResultPerCriteria');
    const allCriteria = await this.readTable('Criteria');

    const criteriaNameById: Record<string, string> = {};
    allCriteria.forEach(c => criteriaNameById[this.asString(c._id)] = this.asString(c.name));

    const myEvaluations = allEvaluations.filter(e => 
      this.asString(e.evaluated_id) === myEmail && activityIds.has(this.asString(e.activity_id))
    );

    if (myEvaluations.length === 0) return [];

    const evaluationIds = new Set(myEvaluations.map(e => this.asString(e._id)));
    const criteriaBuckets: Record<string, number[]> = {};
    const generalScores: number[] = [];

    for (const ev of myEvaluations) {
      generalScores.push(this.asDouble(ev.general_score));
    }

    for (const detail of allDetails) {
      if (!evaluationIds.has(this.asString(detail.evaluation_id))) continue;
      
      const criteriaName = criteriaNameById[this.asString(detail.criteria_id)];
      if (!criteriaName) continue;

      if (!criteriaBuckets[criteriaName]) criteriaBuckets[criteriaName] = [];
      criteriaBuckets[criteriaName].push(this.asDouble(detail.criteria_score));
    }

    const averagesByName: Record<string, number> = {};
    Object.entries(criteriaBuckets).forEach(([name, scores]) => {
      averagesByName[name] = scores.reduce((a, b) => a + b, 0) / scores.length;
    });

    if (generalScores.length > 0) {
      averagesByName['General'] = generalScores.reduce((a, b) => a + b, 0) / generalScores.length;
    }

    return this.orderCriteriaChart(averagesByName);
  }

  async getTeacherHomeCompletionTrend(): Promise<ChartPoint[]> {
    const activities = await this.getTeacherScopedActivities();
    const allGroups = await this.readTable('Group');
    const allMembers = await this.readTable('GroupMember');
    const allEvaluations = await this.readTable('Evaluation');

    const recentActivities = [...activities].sort((a, b) => {
      const aEnd = this.asDateTime(a.end_date) ?? new Date(0);
      const bEnd = this.asDateTime(b.end_date) ?? new Date(0);
      return bEnd.getTime() - aEnd.getTime();
    });

    const selected = recentActivities.slice(0, 7).sort((a, b) => {
      const aEnd = this.asDateTime(a.end_date) ?? new Date(0);
      const bEnd = this.asDateTime(b.end_date) ?? new Date(0);
      return aEnd.getTime() - bEnd.getTime();
    });

    const points: ChartPoint[] = [];

    for (const activity of selected) {
      const activityId = this.asString(activity._id);
      const categoryId = this.asString(activity.category_id);

      const groups = allGroups.filter(g => this.asString(g.category_id) === categoryId);
      let expectedTotal = 0;
      let actualTotal = 0;

      for (const group of groups) {
        const groupId = this.asString(group._id);
        const members = allMembers.filter(m => this.asString(m.group_id) === groupId);
        
        const groupSize = members.length;
        if (groupSize <= 1) continue;

        expectedTotal += groupSize * (groupSize - 1);
        actualTotal += allEvaluations.filter(e => 
          this.asString(e.activity_id) === activityId && this.asString(e.group_id) === groupId
        ).length;
      }

      const percentage = expectedTotal === 0 ? 0.0 : (actualTotal / expectedTotal) * 100.0;
      points.push({
        label: this.shortActivityLabel(this.asString(activity.name)),
        value: Math.min(Math.max(percentage, 0.0), 100.0), // clamp 0-100
      });
    }

    return points;
  }

  async getTeacherCategoryCriteriaAverages(categoryId: string): Promise<ChartPoint[]> {
    const activities = await this.readTable('Activity', { category_id: categoryId });
    const activityIds = new Set(activities.map(a => this.asString(a._id)));

    const allEvaluations = await this.readTable('Evaluation');
    const allDetails = await this.readTable('ResultPerCriteria');
    const allCriteria = await this.readTable('Criteria');

    const criteriaNameById: Record<string, string> = {};
    allCriteria.forEach(c => criteriaNameById[this.asString(c._id)] = this.asString(c.name));

    const categoryEvaluations = allEvaluations.filter(e => activityIds.has(this.asString(e.activity_id)));
    if (categoryEvaluations.length === 0) return [];

    const evaluationIds = new Set(categoryEvaluations.map(e => this.asString(e._id)));
    const criteriaBuckets: Record<string, number[]> = {};
    const generalScores: number[] = [];

    for (const evalRaw of categoryEvaluations) {
      generalScores.push(this.asDouble(evalRaw.general_score));
    }

    for (const detail of allDetails) {
      if (!evaluationIds.has(this.asString(detail.evaluation_id))) continue;
      
      const criteriaName = criteriaNameById[this.asString(detail.criteria_id)];
      if (!criteriaName) continue;

      if (!criteriaBuckets[criteriaName]) criteriaBuckets[criteriaName] = [];
      criteriaBuckets[criteriaName].push(this.asDouble(detail.criteria_score));
    }

    const averagesByName: Record<string, number> = {};
    Object.entries(criteriaBuckets).forEach(([name, scores]) => {
      averagesByName[name] = scores.reduce((a, b) => a + b, 0) / scores.length;
    });

    if (generalScores.length > 0) {
      averagesByName['General'] = generalScores.reduce((a, b) => a + b, 0) / generalScores.length;
    }

    return this.orderCriteriaChart(averagesByName);
  }

  async getStudentAverageMetric(myEmail: string): Promise<DashboardMetric> {
    const scopedActivities = await this.getStudentScopedActivities(myEmail);
    const scopedActivityIds = new Set(scopedActivities.map(a => this.asString(a._id)));

    const allEvaluations = await this.readTable('Evaluation');
    const myReceived = allEvaluations.filter(e => 
      this.asString(e.evaluated_id) === myEmail && scopedActivityIds.has(this.asString(e.activity_id))
    );

    if (myReceived.length === 0) {
      return { title: 'Promedio general', value: '0.0' };
    }

    const average = myReceived.map(e => this.asDouble(e.general_score)).reduce((a, b) => a + b, 0) / myReceived.length;
    return { title: 'Promedio general', value: average.toFixed(1) };
  }

  async getStudentPendingMetric(myEmail: string): Promise<DashboardMetric> {
    const scopedActivities = await this.getStudentScopedActivities(myEmail);
    const allEvaluations = await this.readTable('Evaluation');

    let pending = 0;

    for (const activity of scopedActivities) {
      if (!this.isOpenActivity(activity)) continue;

      const activityId = this.asString(activity._id);
      const alreadyEvaluated = allEvaluations.some(e => 
        this.asString(e.activity_id) === activityId && this.asString(e.evaluator_id) === myEmail
      );

      if (!alreadyEvaluated) pending++;
    }

    return { title: 'Pendientes', value: pending.toString() };
  }

  async getTeacherActiveActivitiesMetric(): Promise<DashboardMetric> {
    const activities = await this.getTeacherScopedActivities();
    const activeCount = activities.filter(a => this.isOpenActivity(a)).length;
    return { title: 'Activas', value: activeCount.toString() };
  }

  async getTeacherPendingGroupsMetric(): Promise<DashboardMetric> {
    const activities = await this.getTeacherScopedActivities();
    const activeActivities = activities.filter(a => this.isOpenActivity(a));

    const allGroups = await this.readTable('Group');
    const allMembers = await this.readTable('GroupMember');
    const allEvaluations = await this.readTable('Evaluation');

    let pendingGroups = 0;

    for (const activity of activeActivities) {
      const activityId = this.asString(activity._id);
      const categoryId = this.asString(activity.category_id);

      const groups = allGroups.filter(g => this.asString(g.category_id) === categoryId);

      for (const group of groups) {
        const groupId = this.asString(group._id);
        const members = allMembers.filter(m => this.asString(m.group_id) === groupId);
        
        const groupSize = members.length;
        const expected = groupSize <= 1 ? 0 : groupSize * (groupSize - 1);
        
        const actual = allEvaluations.filter(e => 
          this.asString(e.activity_id) === activityId && this.asString(e.group_id) === groupId
        ).length;

        if (expected > 0 && actual < expected) pendingGroups++;
      }
    }

    return { title: 'Grupos pendientes', value: pendingGroups.toString() };
  }
}