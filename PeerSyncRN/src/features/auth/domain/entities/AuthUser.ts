export interface AuthUser {
  tokenA: string;
  tokenR: string;
  email: string;
  role: string;
  name: string;
}

// En TypeScript, en lugar de un "factory", solemos usar una función mapeadora
export const authUserFromJson = (json: any): AuthUser => {
  return {
    tokenA: json.accessToken,
    tokenR: json.refreshToken,
    email: json.email,
    name: json.name,
    role: json.role,
  };
};