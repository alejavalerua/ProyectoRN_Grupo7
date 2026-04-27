export const TOKENS = {
  LocalPreferences: Symbol("LocalPreferences"),
  AuthRemoteDS: Symbol("AuthRemoteDS"),
  AuthRepo: Symbol("AuthRepo"),

  CourseRemoteDS: Symbol("CourseRemoteDS"),
  CourseRepo: Symbol("CourseRepo"),
  CategoryRemoteDS: Symbol("CategoryRemoteDS"),
  CategoryRepo: Symbol("CategoryRepo"),

  EvaluationRemoteDS: Symbol("EvaluationRemoteDS"),
  EvaluationRepo: Symbol("EvaluationRepo"),
  EvaluationAnalyticsRemoteDS: Symbol("EvaluationAnalyticsRemoteDS"),
  EvaluationAnalyticsRepo: Symbol("EvaluationAnalyticsRepo"),
  GroupRemoteDS: Symbol("GroupRemoteDS"),
  GroupRepo: Symbol("GroupRepo"),
} as const;