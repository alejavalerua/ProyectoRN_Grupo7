import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Alert } from 'react-native';
import { Course } from '../../domain/entities/Course';
import { ICourseRepository } from '../../domain/repositories/ICourseRepository';
import { useDI } from '../../../../core/di/DIProvider';
import { TOKENS } from '../../../../core/di/tokens';
import { useAuth } from '@/src/features/auth/presentation/context/authContext';
import { showAlert } from '@/src/core/utils/alerts';


interface CourseContextProps {
  courses: Course[];
  isLoading: boolean;
  loadCoursesByUser: () => Promise<void>;
  createCourse: (name: string) => Promise<string | null>;
  joinCourse: (code: string) => Promise<void>;
  updateCourse: (id: string, name: string, code: number) => Promise<void>;
}

const CourseContext = createContext<CourseContextProps | undefined>(undefined);

export const CourseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. Inyección de dependencias estricta
  const container = useDI();
  const repository = container.resolve<ICourseRepository>(TOKENS.CourseRepo);

  // Consumimos el contexto de Auth para obtener el email del usuario actual si es necesario
  const { user } = useAuth(); 

  // 2. Estados Reactivos (Reemplaza a los .obs de GetX)
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // 3. Métodos Principales
  const loadCoursesByUser = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await repository.getCoursesByUser();
      setCourses(response);
      
      // NOTA: La orquestación de otros contextos (Categorías, Evaluaciones)
      // se hará en los componentes/hooks de la UI para evitar acoplamiento circular.
    } catch (error: any) {
      showError(error);
    } finally {
      setIsLoading(false);
    }
  }, [repository]);

  const createCourse = async (name: string): Promise<string | null> => {
    try {
      setIsLoading(true);
      const newCourse: Course = {
        id: Date.now().toString(),
        name: name,
        code: parseInt(Date.now().toString().substring(0, 8), 10),
      };

      const success = await repository.createCourse(newCourse);

      if (success) {
        // En tu lógica de Dart unías al profesor a su propio curso
        const email = user?.email || '';
        await repository.joinCourse(newCourse.code.toString(), email);

        await loadCoursesByUser();
        showSuccess('Curso creado correctamente');
        return newCourse.id;
      }
      return null;
    } catch (error: any) {
      showError(error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const joinCourse = async (code: string): Promise<void> => {
    if (!code.trim()) return;

    try {
      setIsLoading(true);
      const email = user?.email || '';
      await repository.joinCourse(code, email);

      showSuccess('¡Te has inscrito al curso correctamente!');
      await loadCoursesByUser();
    } catch (error: any) {
      showError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateCourse = async (id: string, name: string, code: number): Promise<void> => {
    try {
      setIsLoading(true);
      const updatedCourse: Course = { id, name, code };
      const success = await repository.updateCourse(updatedCourse);

      if (success) {
        await loadCoursesByUser();
        showSuccess('Curso actualizado correctamente');
      }
    } catch (error: any) {
      showError(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Carga automática al iniciar (Equivalente al onInit de GetX)
  useEffect(() => {
    loadCoursesByUser();
  }, [loadCoursesByUser]);

  const showError = (e: any) => {
    const message = e instanceof Error ? e.message : String(e);
    showAlert('Error', message.replace('Exception: ', ''));
  };

  const showSuccess = (message: string) => {
    showAlert('Éxito', message);
  };

  return (
    <CourseContext.Provider
      value={{
        courses,
        isLoading,
        loadCoursesByUser,
        createCourse,
        joinCourse,
        updateCourse,
      }}
    >
      {children}
    </CourseContext.Provider>
  );
};

export const useCourse = (): CourseContextProps => {
  const context = useContext(CourseContext);
  if (!context) throw new Error('useCourse debe usarse dentro de un CourseProvider');
  return context;
};