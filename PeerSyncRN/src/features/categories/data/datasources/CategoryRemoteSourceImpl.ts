import { ICategoryRemoteSource } from './ICategoryRemoteSource';
import { ILocalPreferences } from '../../../../core/iLocalPreferences';

export class CategoryRemoteSourceImpl implements ICategoryRemoteSource {
  private baseUrl = 'https://roble-api.openlab.uninorte.edu.co/database/peer_sync_2e18809588';

  constructor(private localPreferences: ILocalPreferences) {}

  private async getHeaders(): Promise<HeadersInit> {
    const token = await this.localPreferences.retrieveData<string>('tokenA');
    if (!token) throw new Error('No hay sesión activa');
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };
  }

  private async handleResponse(response: Response): Promise<any> {
    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }
    return response.json();
  }

  private extractList(data: any): any[] {
    if (Array.isArray(data)) return data;
    return data?.data || data?.records || [];
  }

  async getCategoriesByCourse(courseId: string): Promise<Record<string, any>[]> {
    const headers = await this.getHeaders();
    const response = await fetch(`${this.baseUrl}/read?tableName=Category&course_id=${courseId}`, { headers });
    const data = await this.handleResponse(response);
    const records = this.extractList(data);

    return records.map((e: any) => ({
      id: (e.category_id ?? e._id).toString(),
      name: e.category_name,
      course_id: e.course_id.toString(),
    }));
  }

  async getCategoriesByStudent(courseId: string): Promise<Record<string, any>[]> {
    const headers = await this.getHeaders();
    
    // Obtenemos el email sin acoplar la UI (limpieza de arquitectura)
    const email = await this.localPreferences.retrieveData<string>('email') || '';

    // 1. OBTENER GROUP MEMBERS
    const memberRes = await fetch(`${this.baseUrl}/read?tableName=GroupMember&email=${email}`, { headers });
    const memberData = await this.handleResponse(memberRes);
    const memberRecords = this.extractList(memberData);

    const groupIds = Array.from(new Set(memberRecords.map((e: any) => e.group_id.toString())));
    if (groupIds.length === 0) return [];

    // 2. OBTENER GRUPOS
    const groupRes = await fetch(`${this.baseUrl}/read?tableName=Group`, { headers });
    const groupData = await this.handleResponse(groupRes);
    const groupRecords = this.extractList(groupData);

    const userGroups = groupRecords.filter((g: any) => groupIds.includes(g._id.toString()));
    const categoryIds = Array.from(new Set(userGroups.map((g: any) => g.category_id.toString())));
    if (categoryIds.length === 0) return [];

    // 3. OBTENER CATEGORÍAS
    const categoryRes = await fetch(`${this.baseUrl}/read?tableName=Category&course_id=${courseId}`, { headers });
    const categoryData = await this.handleResponse(categoryRes);
    const categoryRecords = this.extractList(categoryData);

    const filtered = categoryRecords.filter((c: any) => {
      const id = (c.category_id ?? c._id).toString();
      return categoryIds.includes(id);
    });

    return filtered.map((e: any) => ({
      id: (e.category_id ?? e._id).toString(),
      name: e.category_name,
      course_id: e.course_id.toString(),
    }));
  }
}