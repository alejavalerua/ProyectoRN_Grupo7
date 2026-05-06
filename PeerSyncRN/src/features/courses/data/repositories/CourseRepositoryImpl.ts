import { ICourseRepository } from "../../domain/repositories/ICourseRepository";
import { Course } from "../../domain/entities/Course";
import { ICourseRemoteSource } from "../datasources/ICourseRemoteSource";

import { ILocalPreferences } from "../../../../core/iLocalPreferences";
import { AuthRepository } from "@/src/features/auth/domain/repositories/AuthRepository";

export class CourseRepositoryImpl implements ICourseRepository {
  constructor(
    private dataSource: ICourseRemoteSource,
    private authRepository: AuthRepository,
    private localPreferences: ILocalPreferences,
  ) {}

  async joinCourse(code: string, email: string): Promise<void> {
    console.log("📡 JOIN COURSE → API");

    await this.authRepository.safeRequest(() =>
      this.dataSource.joinCourse(code, email),
    );

    // 🔥 IMPORTANTE: refrescar cursos del usuario
    const userEmail = await this.authRepository.getCurrentUserEmail();

    if (!userEmail) return;

    const cacheKey = `courses_user_${userEmail}`;

    console.log("🔄 ACTUALIZANDO CACHE DESPUÉS DE JOIN");

    try {
      const response = await this.authRepository.safeRequest(() =>
        this.dataSource.getCoursesByUser(),
      );

      const courses: Course[] = response.map((e: any) => ({
        id: e.id,
        name: e.name,
        code: e.code,
      }));

      await this.localPreferences.storeData<Course[]>(cacheKey, courses);

      console.log("💾 CACHE ACTUALIZADA (joinCourse)");
    } catch (e) {
      console.log(`⚠️ ERROR ACTUALIZANDO CACHE: ${e}`);
    }
  }

  async getCourses(): Promise<Course[]> {
    try {
      console.log("🌐 GET COURSES → API CALL");
      const response = await this.authRepository.safeRequest(() =>
        this.dataSource.getCourses(),
      );

      const courses: Course[] = response.map((e: any) => ({
        id: e.id,
        name: e.name,
        code: e.code,
      }));

      // 🔥 Guardar en caché delegando el parseo a ILocalPreferences
      await this.localPreferences.storeData<Course[]>("courses", courses);
      console.log("💾 CACHE SAVED (courses)");

      return courses;
    } catch (e) {
      console.log("❌ API FALLÓ → usando CACHE");

      // 🔥 Leer caché con tipado seguro
      const storedCourses =
        await this.localPreferences.retrieveData<Course[]>("courses");

      if (!storedCourses || storedCourses.length === 0) {
        console.log("⚠️ NO HAY CACHE");
        return [];
      }

      console.log("⚡ CACHE HIT (courses)");
      return storedCourses;
    }
  }

  async createCourse(course: Course): Promise<boolean> {
    try {
      console.log("🌐 CREATE COURSE → API");
      const response = await this.authRepository.safeRequest(() =>
        this.dataSource.createCourse(course.id, course.name, course.code),
      );

      const storedCourses =
        await this.localPreferences.retrieveData<Course[]>("courses");
      let list: Course[] = [];

      if (storedCourses) {
        list = storedCourses;
        console.log("⚡ CACHE LOAD antes de insertar");
      }

      list.push({ id: response.id, name: response.name, code: response.code });

      await this.localPreferences.storeData<Course[]>("courses", list);
      console.log("💾 CACHE UPDATED (course creado)");

      return true;
    } catch (e) {
      console.log(`❌ ERROR creando curso: ${e}`);
      return false;
    }
  }

  async updateCourse(course: Course): Promise<boolean> {
    try {
      console.log("🌐 UPDATE COURSE → API");
      await this.authRepository.safeRequest(() =>
        this.dataSource.updateCourse(course.id, course.name),
      );

      const storedCourses =
        await this.localPreferences.retrieveData<Course[]>("courses");
      if (!storedCourses) {
        console.log("⚠️ No hay cache para actualizar");
        return true;
      }

      let list: Course[] = storedCourses;
      list = list.map((e) => (e.id === course.id ? course : e));

      await this.localPreferences.storeData<Course[]>("courses", list);
      console.log("💾 CACHE UPDATED (course actualizado)");

      return true;
    } catch (e) {
      console.log(`❌ ERROR actualizando curso: ${e}`);
      return false;
    }
  }

  async getCoursesByUser(): Promise<Course[]> {
    const userEmail = await this.authRepository.getCurrentUserEmail();

    if (!userEmail) {
      console.log("❌ No hay usuario logueado");
      return [];
    }

    const cacheKey = `courses_user_${userEmail}`;

    // 🔥 1. INTENTAR LEER CACHÉ PRIMERO (FAST LOAD)
    const cachedCourses =
      await this.localPreferences.retrieveData<Course[]>(cacheKey);

    if (cachedCourses) {
      console.log(`⚡ CARGANDO CURSOS DESDE CACHÉ (${userEmail})`);

      // 🔥 REFRESH EN BACKGROUND (sin bloquear UI ni usar await)
      this._refreshCoursesInBackground(userEmail, cacheKey);

      return cachedCourses;
    }

    // 🔥 2. SI NO HAY CACHÉ → API
    console.log(`🌐 GET COURSES BY USER → API (${userEmail})`);
    const response = await this.authRepository.safeRequest(() =>
      this.dataSource.getCoursesByUser(),
    );

    const courses: Course[] = response.map((e: any) => ({
      id: e.id,
      name: e.name,
      code: e.code,
    }));

    await this.localPreferences.storeData<Course[]>(cacheKey, courses);
    console.log(`💾 CACHE SAVED (${userEmail})`);

    return courses;
  }

  private async _refreshCoursesInBackground(
    userEmail: string,
    cacheKey: string,
  ): Promise<void> {
    try {
      console.log(`🔄 REFRESH EN BACKGROUND (${userEmail})`);
      const response = await this.authRepository.safeRequest(() =>
        this.dataSource.getCoursesByUser(),
      );

      const courses: Course[] = response.map((e: any) => ({
        id: e.id,
        name: e.name,
        code: e.code,
      }));

      await this.localPreferences.storeData<Course[]>(cacheKey, courses);
      console.log(`✅ CACHE ACTUALIZADA (${userEmail})`);
    } catch (e) {
      console.log(`⚠️ ERROR REFRESH BACKGROUND: ${e}`);
    }
  }
}
