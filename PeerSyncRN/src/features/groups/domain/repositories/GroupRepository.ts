export interface GroupRepository {
  importGroupsFromCsv(courseId: string, csvString: string): Promise<void>;
}