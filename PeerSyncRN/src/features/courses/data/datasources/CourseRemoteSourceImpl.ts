import { ICourseRemoteSource } from './ICourseRemoteSource';
import { ILocalPreferences } from '../../../../core/iLocalPreferences';

export class CourseRemoteSourceImpl implements ICourseRemoteSource {
  private baseUrl = 'https://roble-api.openlab.uninorte.edu.co/database/peer_sync_2e18809588';

  // Inyectamos las preferencias locales para obtener el token y el email
  constructor(private localPreferences: ILocalPreferences) {}

  private async getHeaders(): Promise<HeadersInit> {
    // Usamos retrieveData<string>
    const token = await this.localPreferences.retrieveData<string>('tokenA');
    if (!token) throw new Error('No hay sesión activa');
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };
  }

  private async handleResponse(response: Response): Promise<any> {
    if (response.status === 401) throw new Error('401');
    if (response.status !== 200 && response.status !== 201) {
      const errorText = await response.text();
      throw new Error(errorText);
    }
    return response.json(); // Equivalente a jsonDecode(response.body)
  }

  private extractList(data: any): any[] {
    if (Array.isArray(data)) return data;
    return data?.data || data?.records || [];
  }

  async joinCourse(code: string, email: string): Promise<void> {
    const headers = await this.getHeaders();

    // 1. Buscar el curso
    const courseRes = await fetch(`${this.baseUrl}/read?tableName=Course&code=${code}`, { headers });
    const courseData = await this.handleResponse(courseRes);
    const courses = this.extractList(courseData);
    
    if (courses.length === 0) throw new Error('No se encontró un curso con ese código.');
    const courseId = courses[0].course_id ?? courses[0]._id;

    // 2. Buscar el usuario
    const userRes = await fetch(`${this.baseUrl}/read?tableName=Users&email=${email}`, { headers });
    const userData = await this.handleResponse(userRes);
    const users = this.extractList(userData);

    if (users.length === 0) throw new Error('No se encontró el usuario.');
    const userId = users[0].user_id ?? users[0]._id;

    // 3. Validar si ya está inscrito
    const validationRes = await fetch(`${this.baseUrl}/read?tableName=CourseMember&course_id=${courseId}&user_id=${userId}`, { headers });
    const validationData = await this.handleResponse(validationRes);
    const existingMembers = this.extractList(validationData);

    if (existingMembers.length > 0) throw new Error('Ya estás inscrito en este curso.');

    // 4. Insertar miembro
    const insertRes = await fetch(`${this.baseUrl}/insert`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        tableName: 'CourseMember',
        records: [{ course_id: courseId, user_id: userId }],
      }),
    });
    await this.handleResponse(insertRes);
  }

  async getCourses(): Promise<Record<string, any>[]> {
    const headers = await this.getHeaders();
    const response = await fetch(`${this.baseUrl}/read?tableName=Course`, { headers });
    const data = await this.handleResponse(response);
    const records = this.extractList(data);

    return records.map((e: any) => ({
      id: e.course_id.toString(),
      name: e.course_name,
      code: e.code,
    }));
  }

  async createCourse(id: string, name: string, code: number): Promise<Record<string, any>> {
    const headers = await this.getHeaders();
    const response = await fetch(`${this.baseUrl}/insert`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        tableName: 'Course',
        records: [{ course_id: parseInt(id, 10), course_name: name, code }],
      }),
    });
    await this.handleResponse(response);
    return { id, name, code };
  }

  async updateCourse(id: string, name: string): Promise<void> {
    const headers = await this.getHeaders();
    const response = await fetch(`${this.baseUrl}/update`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({
        tableName: 'Course',
        records: [{ course_id: parseInt(id, 10), course_name: name }],
      }),
    });
    await this.handleResponse(response);
  }

  async getCoursesByUser(): Promise<Record<string, any>[]> {
    const headers = await this.getHeaders();
    // Usamos retrieveData<string>
    const email = await this.localPreferences.retrieveData<string>('email');

    const userRes = await fetch(`${this.baseUrl}/read?tableName=Users&email=${email}`, { headers });
    const userData = await this.handleResponse(userRes);
    const users = this.extractList(userData);

    if (users.length === 0) throw new Error('No se encontró el usuario');
    const userId = users[0].user_id ?? users[0]._id;

    const memberRes = await fetch(`${this.baseUrl}/read?tableName=CourseMember&user_id=${userId}`, { headers });
    const memberData = await this.handleResponse(memberRes);
    const members = this.extractList(memberData);

    const courses: Record<string, any>[] = [];

    // Llamadas asíncronas secuenciales por cada curso que tenga el usuario
    for (const member of members) {
      const courseId = member.course_id;
      const courseRes = await fetch(`${this.baseUrl}/read?tableName=Course&course_id=${courseId}`, { headers });
      const courseData = await this.handleResponse(courseRes);
      const records = this.extractList(courseData);

      if (records.length > 0) {
        const e = records[0];
        courses.push({
          id: e.course_id.toString(),
          name: e.course_name,
          code: e.code,
        });
      }
    }
    return courses;
  }
}