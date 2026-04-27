import { GroupRepository } from '../../domain/repositories/GroupRepository';
import { GroupRemoteDataSource } from '../datasources/GroupRemoteDataSource';

export class GroupRepositoryImpl implements GroupRepository {
  constructor(private remoteSource: GroupRemoteDataSource) {}

  async importGroupsFromCsv(courseId: string, csvString: string): Promise<void> {
    await this.remoteSource.importGroupsFromCsv(courseId, csvString);
  }
}