export interface StudentReport {
  email: string;
  firstName: string;
  lastName: string;
  evaluationsGiven: number;
  evaluationsReceived: number;
  finalGrade: number;
  isComplete: boolean;
}

export interface GroupReport {
  groupId: string;
  groupName: string;
  students: StudentReport[];
}