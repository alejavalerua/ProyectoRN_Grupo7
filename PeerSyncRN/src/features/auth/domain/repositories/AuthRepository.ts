import { AuthUser } from '../entities/AuthUser';

export interface AuthRepository {
  signIn(email: string, password: string): Promise<AuthUser>;
  signUp(email: string, password: string, role: string): Promise<AuthUser>;
  getSavedUser(): Promise<AuthUser | null>; // En TS, un valor nullable se indica con | null
  clearUser(): Promise<void>;
  safeRequest<T>(request: () => Promise<T>): Promise<T>;
  sendPasswordResetEmail(email: string): Promise<void>;
  getCurrentUserEmail(): Promise<string | null>;
}