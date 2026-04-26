import { Course } from '../entities/Course';

export interface ICourseRepository {
  joinCourse(code: string, email: string): Promise<void>;
  getCourses(): Promise<Course[]>;
  createCourse(course: Course): Promise<boolean>;
  updateCourse(course: Course): Promise<boolean>;
  getCoursesByUser(): Promise<Course[]>;
}