export interface GroupRemoteDataSource {
  importGroupsFromCsv(courseId: string, csvString: string): Promise<void>;
}