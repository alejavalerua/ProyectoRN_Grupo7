export const TOKENS = {
  LocalPreferences: Symbol("LocalPreferences"), // Agregamos el token de preferencias
  AuthRemoteDS: Symbol("AuthRemoteDS"),
  AuthRepo: Symbol("AuthRepo"),
  ProductRemoteDS: Symbol("ProductRemoteDS"),
  ProductRepo: Symbol("ProductRepo"),
  CourseRemoteDS: Symbol("CourseRemoteDS"), // Token para el DataSource de Cursos
  CourseRepo: Symbol("CourseRepo"),         // Token para el Repositorio de Cursos
} as const;