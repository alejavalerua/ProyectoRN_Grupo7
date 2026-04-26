import React, { createContext, useContext, useState, useEffect } from 'react';
import { Alert, Platform } from 'react-native';
import { AuthUser } from '../../domain/entities/AuthUser';
import { useDI } from '../../../../core/di/DIProvider';
import { TOKENS } from '../../../../core/di/tokens';
import { AuthRepository } from '../../domain/repositories/AuthRepository';
import { showAlert } from '@/src/core/utils/alerts';

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isCheckingSession: boolean; // <-- NUEVO ESTADO
  login: (email: string, pass: string) => Promise<boolean>;
  signUp: (email: string, pass: string, name: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const container = useDI();
  const authRepository = container.resolve<AuthRepository>(TOKENS.AuthRepo);

  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(false); // <-- Ahora por defecto es false
  const [isCheckingSession, setIsCheckingSession] = useState(true); // <-- Inicia en true

  useEffect(() => {
    const checkUser = async () => {
      try {
        const savedUser = await authRepository.getSavedUser();
        setUser(savedUser);
      } finally {
        setIsCheckingSession(false); // Termina la verificación inicial
      }
    };
    checkUser();
  }, []);

  

  const login = async (email: string, pass: string) => {
    setIsLoading(true);
    try {
      const loggedUser = await authRepository.signIn(email, pass);
      setUser(loggedUser);
      return true;
    } catch (error: any) {
      console.error(error);
      showAlert("Error de Inicio de Sesión", error.message || "Credenciales incorrectas");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, pass: string, name: string) => {
    setIsLoading(true);
    try {
      const newUser = await authRepository.signUp(email, pass, name);
      setUser(newUser);
      return true;
    } catch (error: any) {
      console.error(error);
      showAlert("Error de Registro", error.message || "No se pudo crear la cuenta");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    await authRepository.clearUser();
    setUser(null);
    setIsLoading(false);
  };

  const sendPasswordReset = async (email: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      await authRepository.sendPasswordResetEmail(email);
      return true;
    } catch (error: any) {
      console.error(error);
      showAlert("Error", error.message || "No se pudo enviar el correo de recuperación");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, isCheckingSession, login, signUp, signOut, sendPasswordReset }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};