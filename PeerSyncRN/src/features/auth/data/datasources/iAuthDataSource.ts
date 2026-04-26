export interface IAuthDataSource {
  login(email: string, password: string): Promise<any>;
  signUp(email: string, password: string, name: string): Promise<any>;
  refreshToken(refreshToken: string): Promise<any>;
  sendPasswordResetEmail(email: string): Promise<void>;
}