import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthUser } from '../../domain/entities/AuthUser';
import { AuthRepository } from '../../domain/repositories/AuthRepository';
import { IAuthDataSource } from '../datasources/iAuthDataSource';

export class AuthRepositoryImpl implements AuthRepository {
  private _dataSource: IAuthDataSource;

  constructor(dataSource: IAuthDataSource) {
    this._dataSource = dataSource;
  }

  async signIn(email: string, password: string): Promise<AuthUser> {
    const response = await this._dataSource.login(email, password);
    const tokenA = response.accessToken;
    const tokenR = response.refreshToken;
    const role = response.role;
    const name = response.name;

    await AsyncStorage.setItem('tokenA', tokenA);
    await AsyncStorage.setItem('email', email);
    await AsyncStorage.setItem('tokenR', tokenR);
    await AsyncStorage.setItem('name', name);
    await AsyncStorage.setItem('role', role);

    return { tokenA, tokenR, email, role, name };
  }

  async signUp(email: string, password: string, name: string): Promise<AuthUser> {
    const response = await this._dataSource.signUp(email, password, name);
    const tokenA = response.accessToken;
    const tokenR = response.refreshToken;
    const role = 'student';

    await AsyncStorage.setItem('tokenA', tokenA);
    await AsyncStorage.setItem('tokenR', tokenR);
    await AsyncStorage.setItem('email', email);
    await AsyncStorage.setItem('role', role);
    await AsyncStorage.setItem('name', name);

    return { tokenA, tokenR, email, role, name };
  }

  async getSavedUser(): Promise<AuthUser | null> {
    const tokenA = await AsyncStorage.getItem('tokenA');
    const tokenR = await AsyncStorage.getItem('tokenR');
    const email = await AsyncStorage.getItem('email');
    const role = await AsyncStorage.getItem('role');
    const name = await AsyncStorage.getItem('name');

    if (tokenA && tokenR && email && role && name) {
      return { tokenA, tokenR, email, role, name };
    }
    return null;
  }

  async refreshAccessToken(): Promise<string | null> {
    const refreshToken = await AsyncStorage.getItem('tokenR');
    if (!refreshToken) return null;

    try {
      const response = await this._dataSource.refreshToken(refreshToken);
      const newAccessToken = response.accessToken;
      const newRefreshToken = response.refreshToken;

      await AsyncStorage.setItem('tokenA', newAccessToken);
      if (newRefreshToken) {
        await AsyncStorage.setItem('tokenR', newRefreshToken);
      }

      console.log("🔄 Token refrescado correctamente");
      return newAccessToken;
    } catch (e) {
      console.log("❌ Error refrescando token:", e);
      await this.clearUser();
      return null;
    }
  }

  async safeRequest<T>(request: () => Promise<T>): Promise<T> {
    try {
      return await request();
    } catch (e: any) {
      if (e.message && e.message.includes('401')) {
        console.log("🔄 Token expirado, intentando refresh...");
        const newToken = await this.refreshAccessToken();

        if (newToken) {
          console.log("✅ Reintentando request...");
          return await request();
        } else {
          console.log("❌ No se pudo refrescar token");
        }
      }
      throw e;
    }
  }

  async clearUser(): Promise<void> {
    // multiRemove es más eficiente que hacer múltiples .remove()
    await AsyncStorage.multiRemove(['tokenA', 'tokenR', 'email', 'role', 'name']);
  }

  async sendPasswordResetEmail(email: string): Promise<void> {
    await this._dataSource.sendPasswordResetEmail(email);
  }

  async getCurrentUserEmail(): Promise<string | null> {
    return await AsyncStorage.getItem('email');
  }
}