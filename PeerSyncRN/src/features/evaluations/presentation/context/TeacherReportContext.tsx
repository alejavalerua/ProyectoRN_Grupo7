import React, { createContext, useContext, useState, useCallback } from 'react';
import { GroupReport } from '../../domain/entities/ActivityReport';
import { IEvaluationRepository } from '../../domain/repositories/IEvaluationRepository';
import { useDI } from '../../../../core/di/DIProvider';
import { TOKENS } from '../../../../core/di/tokens';
import { showAlert } from '../../../../core/utils/alerts';
import { useTheme } from 'react-native-paper';

interface TeacherReportContextProps {
  isLoading: boolean;
  groupReports: GroupReport[];
  loadReport: (activityId: string, categoryId: string) => Promise<void>;
  formatStudentName: (firstName: string, lastName: string) => string;
  formatGrade: (grade: number) => string;
  getStudentStatusUI: (isComplete: boolean) => { text: string; bgColor: string; textColor: string };
}

const TeacherReportContext = createContext<TeacherReportContextProps | undefined>(undefined);

export const TeacherReportProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const container = useDI();
  const repository = container.resolve<IEvaluationRepository>(TOKENS.EvaluationRepo);
  const theme = useTheme();

  const [isLoading, setIsLoading] = useState(false);
  const [groupReports, setGroupReports] = useState<GroupReport[]>([]);

  const loadReport = async (activityId: string, categoryId: string) => {
    setIsLoading(true);
    try {
      const result = await repository.getActivityReport(activityId, categoryId);
      setGroupReports(result);
    } catch (e: any) { showAlert('Error', e.message); } finally { setIsLoading(false); }
  };

  const formatStudentName = useCallback((firstName: string, lastName: string) => `${firstName} ${lastName}`, []);
  const formatGrade = useCallback((grade: number) => grade.toFixed(1), []);

  const getStudentStatusUI = useCallback((isComplete: boolean) => {
    const isLight = theme.dark === false;
    if (isComplete) {
      return { text: "Evaluaciones completas", bgColor: isLight ? '#D1B3FF' : '#3A3260', textColor: isLight ? 'black' : 'white' };
    } else {
      return { text: "Falta por evaluar", bgColor: isLight ? '#D1B3FF' : '#3A3260', textColor: isLight ? 'black' : 'white' };
    }
  }, [theme.dark]);

  return (
    <TeacherReportContext.Provider value={{ isLoading, groupReports, loadReport, formatStudentName, formatGrade, getStudentStatusUI }}>
      {children}
    </TeacherReportContext.Provider>
  );
};

export const useTeacherReport = () => {
  const context = useContext(TeacherReportContext);
  if (!context) throw new Error('useTeacherReport debe usarse dentro de TeacherReportProvider');
  return context;
};