export interface ICourseRemoteSource {
  joinCourse(code: string, email: string): Promise<void>;
  getCourses(): Promise<Record<string, any>[]>;
  createCourse(id: string, name: string, code: number): Promise<Record<string, any>>;
  updateCourse(id: string, name: string): Promise<void>;
  getCoursesByUser(): Promise<Record<string, any>[]>;
}