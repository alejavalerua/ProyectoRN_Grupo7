import React, { createContext, useContext, useState, useCallback } from 'react';
import { Category } from '../../domain/entities/Category';
import { ICategoryRepository } from '../../domain/repositories/ICategoryRepository';
import { useDI } from '../../../../core/di/DIProvider';
import { TOKENS } from '../../../../core/di/tokens';
import { showAlert } from '../../../../core/utils/alerts';
import { CourseProjectItem } from '../../../courses/presentation/components/CourseCard';

interface CategoryContextProps {
  categories: Category[];
  categoriesByCourse: Record<string, Category[]>;
  isLoading: boolean;
  loadCategories: (courseId: string) => Promise<void>;
  loadCategoriesForCourseCard: (courseId: string) => Promise<void>;
  loadCategoriesByStudent: (courseId: string) => Promise<void>;
  loadCategoriesForCourseCardByStudent: (courseId: string) => Promise<void>;
  getCategoriesPreview: (courseId: string) => Category[];
  getCourseProjectItems: (courseId: string) => CourseProjectItem[];
  getCategoryCountText: (courseId: string) => string;
}

const CategoryContext = createContext<CategoryContextProps | undefined>(undefined);

export const CategoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const container = useDI();
  const repository = container.resolve<ICategoryRepository>(TOKENS.CategoryRepo);

  // Estados Reactivos
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesByCourse, setCategoriesByCourse] = useState<Record<string, Category[]>>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const loadCategories = useCallback(async (courseId: string) => {
    try {
      console.log(`🔥 Cargando categorías para curso: ${courseId}`);
      setIsLoading(true);
      const response = await repository.getCategoriesByCourse(courseId);
      console.log(`📦 Categorías recibidas:`, response);
      setCategories(response);
    } catch (e: any) {
      console.log(`❌ ERROR: ${e}`);
      showAlert('Error', String(e).replace('Exception: ', ''));
    } finally {
      setIsLoading(false);
    }
  }, [repository]);

  const loadCategoriesForCourseCard = useCallback(async (courseId: string) => {
    try {
      // 🚫 Evitar llamadas repetidas
      if (categoriesByCourse[courseId]) return;

      const response = await repository.getCategoriesByCourse(courseId);
      setCategoriesByCourse((prev) => ({ ...prev, [courseId]: response }));
    } catch (e: any) {
      console.log(`❌ Error cargando categorías para curso ${courseId}: ${e}`);
    }
  }, [categoriesByCourse, repository]);

  const loadCategoriesByStudent = useCallback(async (courseId: string) => {
    try {
      console.log(`🎓 Cargando categorías SOLO del estudiante`);
      setIsLoading(true);
      const response = await repository.getCategoriesByStudent(courseId);
      console.log(`📦 Categorías filtradas:`, response);
      setCategories(response);

      // TODO: Aquí en el futuro llamaremos a EvaluationContext para traer 
      // el conteo de actividades activas, probablemente orquestado desde la UI
      // o un hook custom para no acoplar los contextos directamente.
    } catch (e: any) {
      console.log(`❌ ERROR: ${e}`);
      showAlert('Error', String(e).replace('Exception: ', ''));
    } finally {
      setIsLoading(false);
    }
  }, [repository]);

  const loadCategoriesForCourseCardByStudent = useCallback(async (courseId: string) => {
    try {
      // 🚫 evitar repetir llamadas
      if (categoriesByCourse[courseId]) return;

      const response = await repository.getCategoriesByStudent(courseId);
      setCategoriesByCourse((prev) => ({ ...prev, [courseId]: response }));
    } catch (e: any) {
      console.log(`❌ Error cargando preview estudiante: ${e}`);
    }
  }, [categoriesByCourse, repository]);

  /// 🔥 OBTENER PREVIEW
  const getCategoriesPreview = useCallback((courseId: string): Category[] => {
    return categoriesByCourse[courseId] || [];
  }, [categoriesByCourse]);

  const getCourseProjectItems = useCallback((courseId: string): CourseProjectItem[] => {
    const categoriesList = categoriesByCourse[courseId] || [];

    // Lógica de negocio UI: Tomar 3 y formatear
    return categoriesList.slice(0, 3).map((c) => ({
      title: c.name,
      subtitle: "Grupo",
    }));
  }, [categoriesByCourse]);

  const getCategoryCountText = useCallback((courseId: string): string => {
    const count = (categoriesByCourse[courseId] || []).length;
    if (count === 0) return "Sin categorías";
    if (count === 1) return "1 categoría";
    return `${count} categorías`;
  }, [categoriesByCourse]);

  return (
    <CategoryContext.Provider
      value={{
        categories,
        categoriesByCourse,
        isLoading,
        loadCategories,
        loadCategoriesForCourseCard,
        loadCategoriesByStudent,
        loadCategoriesForCourseCardByStudent,
        getCategoriesPreview,
        getCourseProjectItems,
        getCategoryCountText,
      }}
    >
      {children}
    </CategoryContext.Provider>
  );
};

export const useCategory = (): CategoryContextProps => {
  const context = useContext(CategoryContext);
  if (!context) throw new Error('useCategory debe usarse dentro de un CategoryProvider');
  return context;
};