import { GroupRemoteDataSource } from './GroupRemoteDataSource';
import { ILocalPreferences } from '../../../../core/iLocalPreferences';

export class GroupRemoteDataSourceImpl implements GroupRemoteDataSource {
  private dbUrl = 'https://roble-api.openlab.uninorte.edu.co/database/peer_sync_2e18809588';

  constructor(private localPreferences: ILocalPreferences) {}

  // 1. Método seguro para lecturas (Evita errores 500 por espacios)
  private async readTable(
    tableName: string,
    queryParams: Record<string, string>,
    headers: HeadersInit
  ): Promise<any[]> {
    const url = new URL(`${this.dbUrl}/read`);
    url.searchParams.append('tableName', tableName);
    
    Object.entries(queryParams).forEach(([k, v]) => {
      url.searchParams.append(k, v);
    });

    const res = await fetch(url.toString(), { method: 'GET', headers });
    
    if (res.status === 200) {
      const data = await res.json();
      return Array.isArray(data) ? data : (data?.data || data?.records || []);
    } else {
      return [];
    }
  }

  // 2. Método seguro para inserciones
  private async insertTable(
    tableName: string,
    records: Record<string, any>[],
    headers: HeadersInit
  ): Promise<void> {
    const bodyStr = JSON.stringify({ tableName, records });

    const res = await fetch(`${this.dbUrl}/insert`, {
      method: 'POST',
      headers,
      body: bodyStr,
    });

    if (res.status !== 200 && res.status !== 201) {
      const text = await res.text();
      throw new Error(`Error al insertar en ${tableName}: ${text}`);
    } else {
      if (__DEV__) console.log(`Respuesta exitosa al insertar en ${tableName}`);
    }
  }

  // 3. Mini-parser nativo de CSV
  private parseCSV(csvString: string): string[][] {
    // Separa por saltos de línea (manejando \r\n de Windows y \n de Unix)
    const rows = csvString.split(/\r?\n/);
    return rows.map(row => row.split(','));
  }

  async importGroupsFromCsv(courseId: string, csvString: string): Promise<void> {
    const token = await this.localPreferences.retrieveData<string>('tokenA');
    if (!token) throw new Error('No hay sesión activa.');

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };

    // 1. Convertir el texto CSV a una matriz bidimensional
    const rowsAsListOfValues = this.parseCSV(csvString);

    if (rowsAsListOfValues.length <= 1) {
      throw new Error('El archivo CSV está vacío o no tiene datos válidos.');
    }

    // Extraer cabeceras y limpiar espacios
    const header = rowsAsListOfValues[0].map(e => e.trim());
    const colCatName = header.indexOf('Group Category Name');
    const colGroupName = header.indexOf('Group Name');
    const colFirstName = header.indexOf('First Name');
    const colLastName = header.indexOf('Last Name');
    const colEmail = header.indexOf('Email Address');

    if (colCatName === -1 || colGroupName === -1 || colEmail === -1) {
      throw new Error('El CSV no tiene las columnas requeridas.');
    }

    // Transformamos el courseId a número para evitar el error 500
    const intCourseId = parseInt(courseId, 10) || 0;

    const categoryIds: Record<string, string> = {};
    const groupIds: Record<string, string> = {};

    // 2. Iterar filas del CSV
    for (let i = 1; i < rowsAsListOfValues.length; i++) {
      const row = rowsAsListOfValues[i];
      if (row.length < header.length) continue; // Saltar filas incompletas

      const catName = row[colCatName].trim();
      const groupName = row[colGroupName].trim();
      const firstName = row[colFirstName].trim();
      const lastName = row[colLastName].trim();
      const email = row[colEmail].trim();

      if (!catName || !groupName || !email) continue;

      // ==========================================
      // FASE A: GESTIÓN DE LA CATEGORÍA
      // ==========================================
      if (!categoryIds[catName]) {
        let existingCat = await this.readTable('Category', {
          course_id: courseId, // API de lectura espera string
          category_name: catName,
        }, headers);

        if (existingCat.length === 0) {
          await this.insertTable('Category', [{
            course_id: intCourseId, // API de inserción espera int
            category_name: catName,
          }], headers);

          existingCat = await this.readTable('Category', {
            course_id: courseId,
            category_name: catName,
          }, headers);
        }
        categoryIds[catName] = existingCat[0]._id;
      }
      const currentCatId = categoryIds[catName];

      // ==========================================
      // FASE B: GESTIÓN DEL GRUPO
      // ==========================================
      const groupKey = `${currentCatId}-${groupName}`;

      if (!groupIds[groupKey]) {
        let existingGroup = await this.readTable('Group', {
          category_id: currentCatId,
          group_name: groupName,
        }, headers);

        if (existingGroup.length === 0) {
          await this.insertTable('Group', [{
            category_id: currentCatId,
            group_name: groupName,
          }], headers);

          existingGroup = await this.readTable('Group', {
            category_id: currentCatId,
            group_name: groupName,
          }, headers);
        }
        groupIds[groupKey] = existingGroup[0]._id;
      }
      const currentGroupId = groupIds[groupKey];

      // ==========================================
      // FASE C: GESTIÓN DEL MIEMBRO
      // ==========================================
      const existingMember = await this.readTable('GroupMember', {
        group_id: currentGroupId,
        email: email,
      }, headers);

      if (existingMember.length === 0) {
        await this.insertTable('GroupMember', [{
          group_id: currentGroupId,
          email: email,
          first_name: firstName,
          last_name: lastName,
        }], headers);
      }
    }
  }
}