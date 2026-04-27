export const TOKENS = {
  LocalPreferences: Symbol("LocalPreferences"),
  AuthRemoteDS: Symbol("AuthRemoteDS"),
  AuthRepo: Symbol("AuthRepo"),
  ProductRemoteDS: Symbol("ProductRemoteDS"),
  ProductRepo: Symbol("ProductRepo"),
  CourseRemoteDS: Symbol("CourseRemoteDS"),
  CourseRepo: Symbol("CourseRepo"),
  CategoryRemoteDS: Symbol("CategoryRemoteDS"),
  CategoryRepo: Symbol("CategoryRepo"),

  EvaluationRemoteDS: Symbol("EvaluationRemoteDS"),
  EvaluationRepo: Symbol("EvaluationRepo"),
  EvaluationAnalyticsRemoteDS: Symbol("EvaluationAnalyticsRemoteDS"),
  EvaluationAnalyticsRepo: Symbol("EvaluationAnalyticsRepo"),
} as const;