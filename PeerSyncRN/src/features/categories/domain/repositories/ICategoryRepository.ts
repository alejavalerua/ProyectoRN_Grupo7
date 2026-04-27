import { Category } from '../entities/Category';

export interface ICategoryRepository {
  getCategoriesByCourse(courseId: string): Promise<Category[]>;
  getCategoriesByStudent(courseId: string): Promise<Category[]>;
}