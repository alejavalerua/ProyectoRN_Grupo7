export interface ICategoryRemoteSource {
  getCategoriesByCourse(courseId: string): Promise<Record<string, any>[]>;
  getCategoriesByStudent(courseId: string): Promise<Record<string, any>[]>;
}