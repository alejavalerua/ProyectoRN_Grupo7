import React, { createContext, useState, useEffect, useContext } from "react";
import { Alert } from "react-native";
import { AuthUser } from "../../domain/entities/AuthUser";
import { useDI } from "@/src/core/di/DIProvider";
import { TOKENS } from "../../../../core/di/tokens";
import { AuthRepository } from "../../domain/repositories/AuthRepository";

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<boolean>;
  signUp: (email: string, pass: string, name: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const container = useDI();
  const authRepository = container.resolve<AuthRepository>(TOKENS.AuthRepo);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkLoginStatus();
  }, []);

  const checkLoginStatus = async () => {
    setIsLoading(true);
    try {
      const savedUser = await authRepository.getSavedUser();
      if (savedUser) setUser(savedUser);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, pass: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const loggedUser = await authRepository.signIn(email, pass);
      setUser(loggedUser);
      return true; // Retorna true si fue exitoso para navegar en la UI
    } catch (e: any) {
      Alert.alert("Error", e.message.replace("Exception: ", ""));
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (
    email: string,
    pass: string,
    name: string,
  ): Promise<boolean> => {
    setIsLoading(true);
    try {
      const newUser = await authRepository.signUp(email, pass, name);
      setUser(newUser);
      return true;
    } catch (e: any) {
      Alert.alert("Error", e.message.replace("Exception: ", ""));
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
    } catch (e: any) {
      Alert.alert("Error", e.message.replace("Exception: ", ""));
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, isLoading, login, signUp, signOut, sendPasswordReset }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
