import { IEvaluationRemoteSource } from './IEvaluationRemoteSource';
import { ILocalPreferences } from '../../../../core/iLocalPreferences';
import { GroupReport, StudentReport } from '../../domain/entities/ActivityReport';

export class EvaluationRemoteSourceImpl implements IEvaluationRemoteSource {
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

  private async readTable(tableName: string, queryParams: Record<string, string>, headers: HeadersInit): Promise<any[]> {
    const url = new URL(`${this.dbUrl}/read`);
    url.searchParams.append('tableName', tableName);
    Object.entries(queryParams).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });

    const res = await fetch(url.toString(), { headers });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) return data;
      return data?.data || data?.records || [];
    }
    return [];
  }

  private async insertTable(tableName: string, records: Record<string, any>[], headers: HeadersInit): Promise<void> {
    const bodyStr = JSON.stringify({ tableName, records });

    const res = await fetch(`${this.dbUrl}/insert`, {
      method: 'POST',
      headers,
      body: bodyStr,
    });

    if (!res.ok && res.status !== 201) {
      const text = await res.text();
      throw new Error(`Error al insertar en ${tableName}: ${text}`);
    } else {
      console.log(`Respuesta exitosa al insertar en ${tableName}`);
    }
  }

  async createActivity(
    categoryId: string,
    name: string,
    description: string | null,
    startDate: Date,
    endDate: Date,
    visibility: boolean
  ): Promise<void> {
    const headers = await this.getHeaders();
    const startIso = startDate.toISOString();
    const endIso = endDate.toISOString();

    // 1. CREAMOS LA ACTIVIDAD
    const res = await fetch(`${this.dbUrl}/insert`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        tableName: 'Activity',
        records: [
          {
            category_id: categoryId,
            name: name,
            description: description || null,
            start_date: startIso,
            end_date: endIso,
            visibility: visibility,
          },
        ],
      }),
    });

    if (!res.ok && res.status !== 201) {
      throw new Error('Error al crear la actividad');
    }

    // 2. CREAMOS LAS NOTIFICACIONES (Solo si es visible)
    if (visibility) {
      try {
        let catName = 'tu grupo';
        let courseName = 'tu curso';

        const categoryData = await this.readTable('Category', { _id: categoryId }, headers);
        if (categoryData.length > 0) {
          catName = categoryData[0].category_name ?? catName;
          const courseId = categoryData[0].course_id;

          if (courseId) {
            const courseData = await this.readTable('Course', { course_id: courseId.toString() }, headers);
            if (courseData.length > 0) {
              courseName = courseData[0].course_name ?? courseData[0].name ?? courseName;
            }
          }
        }

        const groups = await this.readTable('Group', { category_id: categoryId }, headers);
        const notificationRecords: Record<string, any>[] = [];
        const nowIso = new Date().toISOString();

        for (const g of groups) {
          const members = await this.readTable('GroupMember', { group_id: g._id }, headers);
          for (const m of members) {
            notificationRecords.push({
              user_id: m.email,
              title: `Nueva Actividad: ${name}`,
              body: `Se ha creado esta actividad en ${catName} para el curso de ${courseName}.`,
              is_read: false,
              created_at: nowIso,
            });
          }
        }

        if (notificationRecords.length > 0) {
          await this.insertTable('Notification', notificationRecords, headers);
        }
      } catch (e) {
        console.log('Aviso: Actividad creada, pero falló el envío de notificaciones ricas', e);
      }
    }
  }

  async getActivitiesByCategory(categoryId: string): Promise<Record<string, any>[]> {
    const headers = await this.getHeaders();
    return this.readTable('Activity', { category_id: categoryId }, headers);
  }

  async getPeers(categoryId: string, studentEmail: string): Promise<Record<string, any>[]> {
    const headers = await this.getHeaders();
    
    // 1. Buscar todos los grupos de esta categoría
    const groups = await this.readTable('Group', { category_id: categoryId }, headers);
    let myGroupId: string | null = null;
    
    // 2. Buscar en qué grupo está el estudiante actual
    for (const g of groups) {
      const members = await this.readTable('GroupMember', { group_id: g._id, email: studentEmail }, headers);
      if (members.length > 0) {
        myGroupId = g._id;
        break;
      }
    }

    if (!myGroupId) throw new Error('No tienes un grupo asignado en esta categoría.');

    // 3. Traer a todos los miembros de ese grupo (excluir al usuario se hace usualmente en UI/ViewModel o Repository)
    return this.readTable('GroupMember', { group_id: myGroupId }, headers);
  }

  async getCriteria(activityId: string): Promise<Record<string, any>[]> {
    const headers = await this.getHeaders();
    return this.readTable('Criteria', {}, headers);
  }

  async getMyEvaluations(activityId: string, myEmail: string): Promise<Record<string, Record<string, number>>> {
    const headers = await this.getHeaders();
    
    const evals = await this.readTable('Evaluation', {
      activity_id: activityId,
      evaluator_id: myEmail,
    }, headers);

    const history: Record<string, Record<string, number>> = {};

    for (const ev of evals) {
      const evalId = ev._id;
      const evaluatedEmail = ev.evaluated_id;

      const details = await this.readTable('ResultPerCriteria', { evaluation_id: evalId }, headers);
      
      const scores: Record<string, number> = {};
      for (const d of details) {
        scores[d.criteria_id] = parseFloat(d.criteria_score) || 0.0;
      }

      history[evaluatedEmail] = scores;
    }

    return history;
  }

  async submitEvaluation(
    activityId: string,
    categoryId: string,
    evaluatorEmail: string,
    evaluatedEmail: string,
    comments: string,
    scores: Record<string, number>
  ): Promise<void> {
    const headers = await this.getHeaders();

    const existingEval = await this.readTable('Evaluation', {
      activity_id: activityId,
      evaluator_id: evaluatorEmail,
      evaluated_id: evaluatedEmail,
    }, headers);

    if (existingEval.length > 0) {
      throw new Error('Ya calificaste a este compañero anteriormente.');
    }

    const groups = await this.readTable('Group', { category_id: categoryId }, headers);
    let groupId = null;
    for (const g of groups) {
      const members = await this.readTable('GroupMember', { group_id: g._id, email: evaluatorEmail }, headers);
      if (members.length > 0) {
        groupId = g._id;
        break;
      }
    }

    let total = 0;
    Object.values(scores).forEach(v => total += v);
    const generalScore = total / 4.0;

    await this.insertTable('Evaluation', [{
      activity_id: activityId,
      group_id: groupId,
      evaluator_id: evaluatorEmail,
      evaluated_id: evaluatedEmail,
      comment: comments || null,
      general_score: generalScore,
    }], headers);

    const evals = await this.readTable('Evaluation', {
      activity_id: activityId,
      evaluator_id: evaluatorEmail,
      evaluated_id: evaluatedEmail,
    }, headers);

    if (evals.length === 0) throw new Error('Error de sincronización con la base de datos.');
    const evalId = evals[evals.length - 1]._id;

    const details: Record<string, any>[] = [];
    Object.entries(scores).forEach(([criteriaId, score]) => {
      details.push({
        evaluation_id: evalId,
        criteria_id: criteriaId,
        criteria_score: score,
      });
    });

    if (details.length > 0) {
      await this.insertTable('ResultPerCriteria', details, headers);
    }
  }

  async getMyAverageResults(activityId: string, myEmail: string): Promise<Record<string, number>> {
    const headers = await this.getHeaders();

    const evals = await this.readTable('Evaluation', {
      activity_id: activityId,
      evaluated_id: myEmail,
    }, headers);

    if (evals.length === 0) return {};

    const criteriaScores: Record<string, number[]> = {};
    const generalScores: number[] = [];

    for (const ev of evals) {
      generalScores.push(parseFloat(ev.general_score) || 0.0);

      const details = await this.readTable('ResultPerCriteria', { evaluation_id: ev._id }, headers);
      for (const d of details) {
        const cId = d.criteria_id;
        const val = parseFloat(d.criteria_score) || 0.0;
        if (!criteriaScores[cId]) criteriaScores[cId] = [];
        criteriaScores[cId].push(val);
      }
    }

    const averages: Record<string, number> = {};
    Object.entries(criteriaScores).forEach(([cId, list]) => {
      const sum = list.reduce((a, b) => a + b, 0);
      averages[cId] = sum / list.length;
    });

    const genSum = generalScores.reduce((a, b) => a + b, 0);
    averages['general_score'] = genSum / generalScores.length;

    return averages;
  }

  async getActivityReport(activityId: string, categoryId: string): Promise<GroupReport[]> {
    const headers = await this.getHeaders();

    const allEvaluations = await this.readTable('Evaluation', { activity_id: activityId }, headers);
    const groups = await this.readTable('Group', { category_id: categoryId }, headers);

    const report: GroupReport[] = [];

    for (const g of groups) {
      const groupId = g._id.toString();
      const groupName = g.group_name.toString();

      const members = await this.readTable('GroupMember', { group_id: groupId }, headers);
      const expectedEvaluationsPerStudent = members.length > 1 ? members.length - 1 : 0;

      const studentReports: StudentReport[] = [];

      for (const m of members) {
        const email = m.email.toString();

        const given = allEvaluations.filter(e => e.evaluator_id === email);
        const received = allEvaluations.filter(e => e.evaluated_id === email);

        let sum = 0;
        for (const r of received) {
          sum += parseFloat(r.general_score) || 0.0;
        }
        const finalGrade = received.length === 0 ? 0.0 : (sum / received.length);

        studentReports.push({
          email,
          firstName: m.first_name.toString(),
          lastName: m.last_name.toString(),
          evaluationsGiven: given.length,
          evaluationsReceived: received.length,
          finalGrade,
          isComplete: given.length >= expectedEvaluationsPerStudent,
        });
      }

      report.push({
        groupId,
        groupName,
        students: studentReports,
      });
    }

    return report;
  }
}