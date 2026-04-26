// src/features/auth/data/datasources/AuthRemoteDataSourceImp.ts

import { IAuthDataSource } from './iAuthDataSource';

const generateIntId = () => Date.now();
const ROBLE_PROJECT_ID = 'peer_sync_2e18809588';
// const ROBLE_PROJECT_ID = 'peersyncrn_aef82a178d';

export class AuthRemoteDataSourceImp implements IAuthDataSource {
  private readonly authBaseUrl = `https://roble-api.openlab.uninorte.edu.co/auth/${ROBLE_PROJECT_ID}`;
  private readonly dbBaseUrl = `https://roble-api.openlab.uninorte.edu.co/database/${ROBLE_PROJECT_ID}`;

  async login(email: string, password: string): Promise<any> {
    // 1. HACEMOS LOGIN EN AUTH
    const authResponse = await fetch(`${this.authBaseUrl}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!authResponse.ok) {
      const errorText = await authResponse.text();
      throw new Error(`Error en Login: ${errorText}`);
    }

    const authData = await authResponse.json();
    const accessToken = authData.accessToken;

    // 2. BUSCAMOS AL USUARIO EN LA TABLA "Users"
    try {
      const dbResponse = await fetch(`${this.dbBaseUrl}/read?tableName=Users&email=${encodeURIComponent(email)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (dbResponse.ok) {
        const dbData = await dbResponse.json();
        const records = Array.isArray(dbData) ? dbData : (dbData.data ?? dbData.records ?? []);

        if (records.length > 0) {
          const userRecord = records[0];
          const firstName = userRecord.first_name || '';
          const lastName = userRecord.last_name || '';
          authData.name = `${firstName} ${lastName}`.trim();
          authData.role = userRecord.role || 'student';
        } else {
          authData.name = email.split('@')[0];
          authData.role = 'student';
        }
      } else {
        authData.name = email.split('@')[0];
        authData.role = 'student';
      }
    } catch (error) {
      authData.name = email.split('@')[0];
      authData.role = 'student';
    }

    return authData;
  }

  async signUp(email: string, password: string, name: string): Promise<any> {
    // 1. CREAR CUENTA EN AUTH
    const authResponse = await fetch(`${this.authBaseUrl}/signup-direct`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name }),
    });

    if (!authResponse.ok) {
      const errorText = await authResponse.text();
      throw new Error(`Error en registro: ${errorText}`);
    }

    // 2. INICIAR SESIÓN AUTOMÁTICAMENTE
    const loginResponse = await fetch(`${this.authBaseUrl}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!loginResponse.ok) {
      const errorText = await loginResponse.text();
      throw new Error(`Cuenta creada, pero falló el auto-login: ${errorText}`);
    }

    const authData = await loginResponse.json();
    const accessToken = authData.accessToken;

    // 3. PREPARAR DATOS
    const nameParts = name.trim().split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';

    // 4. INSERTAR EN LA BASE DE DATOS
    const dbResponse = await fetch(`${this.dbBaseUrl}/insert`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        tableName: 'Users',
        records: [
          {
            user_id: generateIntId(),
            email: email,
            first_name: firstName,
            last_name: lastName,
            role: 'student',
          },
        ],
      }),
    });

    if (dbResponse.ok) {
      return authData;
    } else {
      const errorText = await dbResponse.text();
      throw new Error(`Cuenta creada, pero falló al guardar en tabla Users: ${errorText}`);
    }
  }

  async refreshToken(refreshToken: string): Promise<any> {
    const response = await fetch(`${this.authBaseUrl}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    if (response.ok) {
      return await response.json();
    } else {
      throw new Error("Sesión expirada");
    }
  }

  async sendPasswordResetEmail(email: string): Promise<void> {
    const response = await fetch(`${this.authBaseUrl}/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error al solicitar cambio de contraseña: ${errorText}`);
    }
  }
}