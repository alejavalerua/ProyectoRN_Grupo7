import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { Activity } from '../../domain/entities/Activity';
import { IEvaluationRepository } from '../../domain/repositories/IEvaluationRepository';
import { useDI } from '../../../../core/di/DIProvider';
import { TOKENS } from '../../../../core/di/tokens';
import { showAlert } from '../../../../core/utils/alerts';

interface EvaluationContextProps {
  activities: Activity[];
  teacherActivities: Activity[];
  homeActivities: Activity[];
  activeActivitiesCountByCategory: Record<string, number>;
  pendingActivitiesCountByCategory: Record<string, number>;
  isLoadingActivities: boolean;
  isLoadingTeacherActivities: boolean;
  isLoadingHomeActivities: boolean;
  isSaving: boolean;

  loadActivities: (categoryId: string) => Promise<void>;
  loadTeacherActivities: (categoryId: string) => Promise<void>;
  loadActiveActivitiesCount: (categoryId: string) => Promise<void>;
  loadPendingActivitiesCount: (categoryId: string) => Promise<void>;
  loadHomeActivitiesPreview: (categoryIds: string[]) => Promise<void>;
  saveActivity: (
    categoryId: string,
    data: {
      name: string;
      description?: string;
      startDate: Date;
      endDate: Date;
      isVisible: boolean;
    }
  ) => Promise<boolean>;

  sortedActivities: Activity[];
  getActivityUIData: (activity: Activity) => any;
  getTeacherActivityUIData: (activity: Activity) => any;
  getActiveActivitySubtitle: (categoryId: string) => string;
  getPendingActivitySubtitle: (categoryId: string) => string;
}

const EvaluationContext = createContext<EvaluationContextProps | undefined>(undefined);

export const EvaluationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const container = useDI();
  const repository = container.resolve<IEvaluationRepository>(TOKENS.EvaluationRepo);

  const [activities, setActivities] = useState<Activity[]>([]);
  const [teacherActivities, setTeacherActivities] = useState<Activity[]>([]);
  const [homeActivities, setHomeActivities] = useState<Activity[]>([]);
  const [activeActivitiesCountByCategory, setActiveActivitiesCountByCategory] =
    useState<Record<string, number>>({});
  const [pendingActivitiesCountByCategory, setPendingActivitiesCountByCategory] =
    useState<Record<string, number>>({});

  const [isLoadingActivities, setIsLoadingActivities] = useState(false);
  const [isLoadingTeacherActivities, setIsLoadingTeacherActivities] = useState(false);
  const [isLoadingHomeActivities, setIsLoadingHomeActivities] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const getActivityPriority = useCallback((activity: Activity) => {
    const now = new Date();
    if (now > activity.endDate) return 2;
    if (now < activity.startDate) return 1;
    return 0;
  }, []);

  const sortedActivities = useMemo(() => {
    return [...activities].sort((a, b) => {
      const priorityA = getActivityPriority(a);
      const priorityB = getActivityPriority(b);
      if (priorityA !== priorityB) return priorityA - priorityB;
      if (priorityA === 0) return a.endDate.getTime() - b.endDate.getTime();
      if (priorityA === 1) return a.startDate.getTime() - b.startDate.getTime();
      return b.endDate.getTime() - a.endDate.getTime();
    });
  }, [activities, getActivityPriority]);

  const getActivityUIData = useCallback((activity: Activity) => {
    const now = new Date();
    const isExpired = now > activity.endDate;
    const isPending = now < activity.startDate;
    const isActive = !isExpired && !isPending;

    const monthNames = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];
    const targetDate = isPending ? activity.startDate : activity.endDate;

    const monthStr = monthNames[targetDate.getMonth()];
    const dayStr = targetDate.getDate().toString();

    let hour = targetDate.getHours();
    const amPm = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12 || 12;
    const minute = targetDate.getMinutes().toString().padStart(2, '0');
    const timeStr = `${hour}:${minute} ${amPm}`;

    const label = isExpired ? 'Vencida' : isPending ? 'Próximamente' : 'Pendiente';
    const detail = isExpired
      ? `• Cierre: ${dayStr} ${monthStr} ${timeStr}`
      : isPending
      ? `• Abre: ${dayStr} ${monthStr} ${timeStr}`
      : `• Cierre: ${dayStr} ${monthStr} ${timeStr}`;

    return {
      month: monthStr,
      day: dayStr,
      statusLabel: label,
      statusDetail: detail,
      isExpired,
      isPending,
      isActive,
    };
  }, []);

  const getTeacherActivityUIData = useCallback((activity: Activity) => {
    const now = new Date();
    const isExpired = now > activity.endDate;
    const isPending = now < activity.startDate;

    const monthNames = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];
    const monthStr = monthNames[activity.endDate.getMonth()];
    const dayStr = activity.endDate.getDate().toString();

    let hour = activity.endDate.getHours();
    const amPm = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12 || 12;
    const minute = activity.endDate.getMinutes().toString().padStart(2, '0');
    const timeStr = `${hour}:${minute} ${amPm}`;

    const statusTag = isExpired ? 'Finalizada' : isPending ? 'Programada' : 'En curso';
    const statusDetail = !activity.visibility ? '• Oculta (Borrador)' : `• Cierra ${timeStr}`;

    return { month: monthStr, day: dayStr, statusTag, statusDetail, isExpired };
  }, []);

  const getActiveActivitySubtitle = useCallback((categoryId: string) => {
    const count = activeActivitiesCountByCategory[categoryId] || 0;
    if (count === 0) return 'Sin actividades activas';
    if (count === 1) return '1 actividad activa';
    return `${count} actividades activas`;
  }, [activeActivitiesCountByCategory]);

  const getPendingActivitySubtitle = useCallback((categoryId: string) => {
    const count = pendingActivitiesCountByCategory[categoryId] || 0;
    if (count === 0) return 'Sin actividades pendientes';
    if (count === 1) return '1 actividad pendiente';
    return `${count} actividades pendientes`;
  }, [pendingActivitiesCountByCategory]);

  const saveActivity = async (
    categoryId: string,
    data: {
      name: string;
      description?: string;
      startDate: Date;
      endDate: Date;
      isVisible: boolean;
    }
  ) => {
    try {
      setIsSaving(true);
      await repository.createActivity(
        categoryId,
        data.name,
        data.description || '',
        data.startDate,
        data.endDate,
        data.isVisible
      );
      return true;
    } catch (e: any) {
      showAlert('Error', e.message);
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const loadActivities = async (categoryId: string) => {
    setIsLoadingActivities(true);
    try {
      const res = await repository.getActivitiesByCategory(categoryId);
      setActivities(res);
    } catch (e) {
      console.log(e);
    } finally {
      setIsLoadingActivities(false);
    }
  };

  const loadTeacherActivities = async (categoryId: string) => {
    setIsLoadingTeacherActivities(true);
    try {
      const res = await repository.getActivitiesByCategory(categoryId);
      setTeacherActivities(res);
    } catch (e) {
      console.log(e);
    } finally {
      setIsLoadingTeacherActivities(false);
    }
  };

  const loadActiveActivitiesCount = async (categoryId: string) => {
    try {
      const res = await repository.getActivitiesByCategory(categoryId);
      const visible = res.filter((a) => a.visibility);
      const now = new Date();
      const activeCount = visible.filter((a) => now >= a.startDate && now <= a.endDate).length;

      setActiveActivitiesCountByCategory((prev) => ({
        ...prev,
        [categoryId]: activeCount,
      }));
    } catch (e) {}
  };

  const loadPendingActivitiesCount = async (categoryId: string) => {
    try {
      const res = await repository.getActivitiesByCategory(categoryId);
      const visible = res.filter((a) => a.visibility);
      const now = new Date();

      const pendingCount = visible.filter((a) => now <= a.endDate).length;

      setPendingActivitiesCountByCategory((prev) => ({
        ...prev,
        [categoryId]: pendingCount,
      }));
    } catch (e) {}
  };

  const loadHomeActivitiesPreview = async (categoryIds: string[]) => {
    setIsLoadingHomeActivities(true);
    try {
      let all: Activity[] = [];
      for (const cid of categoryIds) {
        const res = await repository.getActivitiesByCategory(cid);
        all = [...all, ...res.filter((a) => a.visibility)];
      }

      const now = new Date();
      all.sort((a, b) => {
        const aExp = now > a.endDate;
        const bExp = now > b.endDate;
        if (aExp !== bExp) return aExp ? 1 : -1;
        if (!aExp && !bExp) {
          return (
            Math.abs(a.endDate.getTime() - now.getTime()) -
            Math.abs(b.endDate.getTime() - now.getTime())
          );
        }
        return b.endDate.getTime() - a.endDate.getTime();
      });

      setHomeActivities(all.slice(0, 3));
    } catch (e) {
      console.log(e);
    } finally {
      setIsLoadingHomeActivities(false);
    }
  };

  return (
    <EvaluationContext.Provider
      value={{
        activities,
        teacherActivities,
        homeActivities,
        activeActivitiesCountByCategory,
        pendingActivitiesCountByCategory,
        isLoadingActivities,
        isLoadingTeacherActivities,
        isLoadingHomeActivities,
        isSaving,
        loadActivities,
        loadTeacherActivities,
        loadActiveActivitiesCount,
        loadPendingActivitiesCount,
        loadHomeActivitiesPreview,
        saveActivity,
        sortedActivities,
        getActivityUIData,
        getTeacherActivityUIData,
        getActiveActivitySubtitle,
        getPendingActivitySubtitle,
      }}
    >
      {children}
    </EvaluationContext.Provider>
  );
};

export const useEvaluation = () => {
  const context = useContext(EvaluationContext);
  if (!context) throw new Error('useEvaluation debe usarse dentro de EvaluationProvider');
  return context;
};