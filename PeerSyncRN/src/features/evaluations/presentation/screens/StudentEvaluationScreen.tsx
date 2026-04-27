import React, { useEffect } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Text, useTheme, Appbar, Button } from 'react-native-paper';
import { useRoute, useNavigation } from '@react-navigation/native';

import { useEvaluationForm } from '../context/EvaluationFormContext';
import { PeerEvaluationCard } from '../components/PeerEvaluationCard';
import { EditablePeerEvaluationCard } from '../components/EditablePeerEvaluationCard';

export default function StudentEvaluationScreen() {
  const theme = useTheme();
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  
  const { activityId, activityName, categoryId, visibility, isExpired } = route.params;

  const {
    isLoading,
    loadFormData,
    myPeerData,
    otherPeers,
    myAverageResults,
    myGeneralScore,
    formatName,
    getMyScoreText,
    getSavedScoreForPeer,
    getEvaluationStatusText,
    updateScoreForPeer,
    submitEvaluationForPeer,
    submittingPeers,
    completedEvaluations,
  } = useEvaluationForm();

  useEffect(() => {
    loadFormData(activityId, categoryId);
  }, [activityId, categoryId]);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Appbar.Header style={{ backgroundColor: theme.colors.background }}>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title={activityName} titleStyle={{ fontSize: 18, fontWeight: 'bold' }} />
      </Appbar.Header>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          
          {/* SECCIÓN: MIS RESULTADOS */}
          <Text variant="titleLarge" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
            Mis resultados
          </Text>

          {visibility ? (
            myPeerData && (
              <PeerEvaluationCard
                studentName={formatName(myPeerData.firstName, myPeerData.lastName)}
                progressText={Object.keys(myAverageResults).length === 0 ? "Aún no te han evaluado" : "Promedio actual"}
                canExpand={true}
                puntualidad={{ subtitle: "Promedio", score: getMyScoreText("Puntualidad") }}
                contribucion={{ subtitle: "Promedio", score: getMyScoreText("Contribución") }}
                compromiso={{ subtitle: "Promedio", score: getMyScoreText("Compromiso") }}
                actitud={{ subtitle: "Promedio", score: getMyScoreText("Actitud") }}
                general={{ subtitle: "Nota Final", score: myGeneralScore }}
              />
            )
          ) : (
            <View style={[styles.lockedBox, { backgroundColor: theme.colors.surface }]}>
              <Text style={{ textAlign: 'center', color: theme.colors.onSurfaceVariant, fontWeight: '600' }}>
                Los resultados de esta evaluación no son visibles.
              </Text>
            </View>
          )}

          <View style={{ height: 35 }} />

          {/* SECCIÓN: EVALUACIONES A COMPAÑEROS */}
          <Text variant="titleLarge" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
            Evaluaciones
          </Text>

          {otherPeers.length === 0 && (
            <Text style={{ color: theme.colors.onSurfaceVariant }}>
              No hay más compañeros en tu grupo para evaluar.
            </Text>
          )}

          {otherPeers.map((peer) => {
            const isAlreadyEvaluated = !!completedEvaluations[peer.email];
            const isReadOnly = isAlreadyEvaluated || isExpired;
            const isSubmitting = !!submittingPeers[peer.email];

            return (
              <View key={peer.email} style={{ marginBottom: 32 }}>
                <EditablePeerEvaluationCard
                  studentName={formatName(peer.firstName, peer.lastName)}
                  progressText={getEvaluationStatusText(peer.email, isExpired)}
                  isReadOnly={isReadOnly}
                  initialPuntualidad={getSavedScoreForPeer(peer.email, "Puntualidad")}
                  initialContribucion={getSavedScoreForPeer(peer.email, "Contribución")}
                  initialCompromiso={getSavedScoreForPeer(peer.email, "Compromiso")}
                  initialActitud={getSavedScoreForPeer(peer.email, "Actitud")}
                  onScoresChanged={(scores) => {
                    if (!isAlreadyEvaluated) {
                      if(scores.puntualidad) updateScoreForPeer(peer.email, "Puntualidad", scores.puntualidad);
                      if(scores.contribucion) updateScoreForPeer(peer.email, "Contribución", scores.contribucion);
                      if(scores.compromiso) updateScoreForPeer(peer.email, "Compromiso", scores.compromiso);
                      if(scores.actitud) updateScoreForPeer(peer.email, "Actitud", scores.actitud);
                    }
                  }}
                />

                {/* Botón de Guardar */}
                {!isReadOnly && (
                  <Button
                    mode="contained"
                    loading={isSubmitting}
                    disabled={isSubmitting}
                    icon="content-save"
                    style={styles.saveButton}
                    contentStyle={{ paddingVertical: 6 }}
                    onPress={() => submitEvaluationForPeer(activityId, categoryId, peer.email)}
                  >
                    Guardar evaluación
                  </Button>
                )}
              </View>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { padding: 20, paddingBottom: 40 },
  sectionTitle: { fontWeight: 'bold', marginBottom: 16 },
  lockedBox: { padding: 16, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  saveButton: { marginTop: 12, borderRadius: 12 },
});