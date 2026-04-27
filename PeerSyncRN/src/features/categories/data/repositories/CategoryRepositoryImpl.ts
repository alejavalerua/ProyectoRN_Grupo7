import { ICategoryRepository } from '../../domain/repositories/ICategoryRepository';
import { Category } from '../../domain/entities/Category';
import { ICategoryRemoteSource } from '../datasources/ICategoryRemoteSource';
import { AuthRepository } from '@/src/features/auth/domain/repositories/AuthRepository';
import { ILocalPreferences } from '../../../../core/iLocalPreferences';

export class CategoryRepositoryImpl implements ICategoryRepository {
  constructor(
    private remote: ICategoryRemoteSource,
    private authRepository: AuthRepository,
    private localPreferences: ILocalPreferences
  ) {}

  async getCategoriesByCourse(courseId: string): Promise<Category[]> {
    const data = await this.remote.getCategoriesByCourse(courseId);
    return data.map((e) => ({
      id: e.id,
      name: e.name,
      courseId: e.course_id,
    }));
  }

  async getCategoriesByStudent(courseId: string): Promise<Category[]> {
    const userEmail = await this.authRepository.getCurrentUserEmail();

    if (!userEmail) {
      console.log('❌ No hay usuario logueado');
      return [];
    }

    // 🔥 Claves únicas
    const cacheKey = `categories_${userEmail}_${courseId}`;
    const cacheTimeKey = `categories_time_${userEmail}_${courseId}`;

    const cachedCategories = await this.localPreferences.retrieveData<Category[]>(cacheKey);
    const cacheTime = await this.localPreferences.retrieveData<number>(cacheTimeKey);

    const now = Date.now();
    const cacheDuration = 1 * 60 * 1000; // ⏱ 1 minuto en milisegundos

    // 🔥 SI HAY CACHE Y MARCA DE TIEMPO
    if (cachedCategories && cacheTime) {
      const isFresh = (now - cacheTime) < cacheDuration;

      console.log(`📦 CACHE encontrada (${cacheKey})`);
      console.log(`⏱ Cache fresca: ${isFresh}`);

      if (isFresh) {
        console.log('⚡ USANDO CACHE FRESCA (categories)');
        return cachedCategories;
      }

      console.log('🟡 CACHE VIEJA → REFRESH EN BACKGROUND');
      // No bloqueamos la UI esperando esto
      this._refreshCategoriesInBackground(courseId, cacheKey, cacheTimeKey);

      return cachedCategories;
    }

    // 🌐 NO HAY CACHE → LLAMAR API
    console.log('🌐 GET CATEGORIES BY STUDENT → API');
    const data = await this.remote.getCategoriesByStudent(courseId);

    const categories: Category[] = data.map((e) => ({
      id: e.id,
      name: e.name,
      courseId: e.course_id,
    }));

    // 💾 GUARDAR CACHE Y TIEMPO
    await this.localPreferences.storeData<Category[]>(cacheKey, categories);
    await this.localPreferences.storeData<number>(cacheTimeKey, now);

    console.log(`💾 CACHE SAVED (${cacheKey})`);
    return categories;
  }

  private async _refreshCategoriesInBackground(
    courseId: string,
    cacheKey: string,
    cacheTimeKey: string
  ): Promise<void> {
    try {
      console.log('🔄 REFRESH CATEGORIES EN BACKGROUND');
      const data = await this.remote.getCategoriesByStudent(courseId);

      const categories: Category[] = data.map((e) => ({
        id: e.id,
        name: e.name,
        courseId: e.course_id,
      }));

      await this.localPreferences.storeData<Category[]>(cacheKey, categories);
      await this.localPreferences.storeData<number>(cacheTimeKey, Date.now());

      console.log('✅ CACHE ACTUALIZADA (categories)');
    } catch (e) {
      console.log(`⚠️ ERROR REFRESH CATEGORIES: ${e}`);
    }
  }
}