import React, { createContext, useContext, useState, useCallback } from 'react';
import { Peer } from '../../domain/entities/Peer';
import { Criteria } from '../../domain/entities/Criteria';
import { IEvaluationRepository } from '../../domain/repositories/IEvaluationRepository';
import { useDI } from '../../../../core/di/DIProvider';
import { TOKENS } from '../../../../core/di/tokens';

import { showAlert } from '../../../../core/utils/alerts';
import { useAuth } from '@/src/features/auth/presentation/context/authContext';

interface EvaluationFormContextProps {
  isLoading: boolean;
  peers: Peer[];
  criteriaList: Criteria[];
  pendingEvaluations: Record<string, Record<string, number>>;
  completedEvaluations: Record<string, Record<string, number>>;
  myAverageResults: Record<string, number>;
  submittingPeers: Record<string, boolean>;

  myPeerData?: Peer;
  otherPeers: Peer[];
  myGeneralScore: string;

  formatName: (first: string, last: string) => string;
  getMyScoreText: (criteriaName: string) => string;
  getSavedScoreForPeer: (peerEmail: string, criteriaName: string) => number | undefined;
  getEvaluationStatusText: (peerEmail: string, isExpired: boolean) => string;

  loadFormData: (activityId: string, categoryId: string) => Promise<void>;
  updateScoreForPeer: (peerEmail: string, criteriaName: string, score: number) => void;
  submitEvaluationForPeer: (activityId: string, categoryId: string, evaluatedEmail: string) => Promise<void>;
}

const EvaluationFormContext = createContext<EvaluationFormContextProps | undefined>(undefined);

export const EvaluationFormProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const container = useDI();
  const repository = container.resolve<IEvaluationRepository>(TOKENS.EvaluationRepo);
  const { user } = useAuth();
  const myEmail = user?.email || '';

  const [isLoading, setIsLoading] = useState(false);
  const [peers, setPeers] = useState<Peer[]>([]);
  const [criteriaList, setCriteriaList] = useState<Criteria[]>([]);
  const [pendingEvaluations, setPendingEvaluations] = useState<Record<string, Record<string, number>>>({});
  const [completedEvaluations, setCompletedEvaluations] = useState<Record<string, Record<string, number>>>({});
  const [myAverageResults, setMyAverageResults] = useState<Record<string, number>>({});
  const [submittingPeers, setSubmittingPeers] = useState<Record<string, boolean>>({});

  const myPeerData = peers.find(p => p.email === myEmail);
  const otherPeers = peers.filter(p => p.email !== myEmail);
  const myGeneralScore = myAverageResults['general_score']?.toFixed(1) || '0.0';

  const formatName = useCallback((first: string, last: string) => {
    return `${first} ${last}`.toLowerCase().split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  }, []);

  const getMyScoreText = useCallback((criteriaName: string) => {
    const normalized = criteriaName.toLowerCase().replace('ó', 'o');
    const criteria = criteriaList.find(c => c.name.toLowerCase().replace('ó', 'o') === normalized);
    return (criteria && myAverageResults[criteria.id]) ? myAverageResults[criteria.id].toFixed(1) : '0.0';
  }, [criteriaList, myAverageResults]);

  const getSavedScoreForPeer = useCallback((peerEmail: string, criteriaName: string) => {
    if (!completedEvaluations[peerEmail]) return undefined;
    const criteria = criteriaList.find(c => c.name === criteriaName);
    return criteria ? completedEvaluations[peerEmail][criteria.id] : undefined;
  }, [completedEvaluations, criteriaList]);

  const getEvaluationStatusText = useCallback((peerEmail: string, isExpired: boolean) => {
    if (completedEvaluations[peerEmail]) return "Completado";
    if (isExpired) return "No evaluado";
    return "Pendiente";
  }, [completedEvaluations]);

  const loadFormData = async (activityId: string, categoryId: string) => {
    setIsLoading(true);
    try {
      const [fetchedPeers, fetchedCriteria, myEvals, myAvg] = await Promise.all([
        repository.getPeers(categoryId, myEmail),
        repository.getCriteria(activityId),
        repository.getMyEvaluations(activityId, myEmail),
        repository.getMyAverageResults(activityId, myEmail)
      ]);
      setPeers(fetchedPeers);
      setCriteriaList(fetchedCriteria);
      setCompletedEvaluations(myEvals);
      setMyAverageResults(myAvg);
    } catch (e: any) { showAlert('Error', e.message); } finally { setIsLoading(false); }
  };

  const updateScoreForPeer = (peerEmail: string, criteriaName: string, score: number) => {
    setPendingEvaluations(prev => ({
      ...prev,
      [peerEmail]: { ...(prev[peerEmail] || {}), [criteriaName]: score }
    }));
  };

  const submitEvaluationForPeer = async (activityId: string, categoryId: string, evaluatedEmail: string) => {
    const scoresToSubmit = pendingEvaluations[evaluatedEmail];
    if (!scoresToSubmit || Object.keys(scoresToSubmit).length < 4) {
      showAlert('Error', 'Por favor, califica todos los criterios antes de guardar.');
      return;
    }

    setSubmittingPeers(prev => ({ ...prev, [evaluatedEmail]: true }));
    try {
      const dbScores: Record<string, number> = {};
      Object.entries(scoresToSubmit).forEach(([uiName, score]) => {
        const criteria = criteriaList.find(c => c.name.toLowerCase().replace('ó', 'o') === uiName.toLowerCase().replace('ó', 'o'));
        if (criteria) dbScores[criteria.id] = score;
      });

      await repository.submitEvaluation(activityId, categoryId, myEmail, evaluatedEmail, "", dbScores);
      showAlert('Éxito', 'Evaluación guardada exitosamente.');
      
      setPendingEvaluations(prev => { const n = {...prev}; delete n[evaluatedEmail]; return n; });
      const updatedEvals = await repository.getMyEvaluations(activityId, myEmail);
      setCompletedEvaluations(updatedEvals);
    } catch (e: any) { showAlert('Error', e.message); } finally {
      setSubmittingPeers(prev => ({ ...prev, [evaluatedEmail]: false }));
    }
  };

  return (
    <EvaluationFormContext.Provider value={{ isLoading, peers, criteriaList, pendingEvaluations, completedEvaluations, myAverageResults, submittingPeers, myPeerData, otherPeers, myGeneralScore, formatName, getMyScoreText, getSavedScoreForPeer, getEvaluationStatusText, loadFormData, updateScoreForPeer, submitEvaluationForPeer }}>
      {children}
    </EvaluationFormContext.Provider>
  );
};

export const useEvaluationForm = () => {
  const context = useContext(EvaluationFormContext);
  if (!context) throw new Error('useEvaluationForm debe usarse dentro de EvaluationFormProvider');
  return context;
};