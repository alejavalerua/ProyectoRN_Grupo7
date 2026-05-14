import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Text, useTheme, Appbar, FAB, Surface, IconButton } from 'react-native-paper';
import { useRoute, useNavigation } from '@react-navigation/native';
import * as Clipboard from 'expo-clipboard';
import * as DocumentPicker from 'expo-document-picker';

import { useCategory } from '../context/CategoryContext';
import { useCourse } from '../../../courses/presentation/context/CourseContext';
import { useGroup } from '../../../groups/presentation/context/GroupContext';
import { useEvaluation } from '../../../evaluations/presentation/context/EvaluationContext';
import { CategoryCard } from '../components/CategoryCard';
import { CreateCategoryModal } from '../components/CreateCategoryModal';
import { showAlert } from '../../../../core/utils/alerts';

export default function TeacherCourseDetailScreen() {
  const theme = useTheme();
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { courseId, courseTitle } = route.params;

  const { categories, isLoading: isLoadingCategories, loadCategories } = useCategory();
  const { courses } = useCourse();
  const { importCsvData, isLoading: isImporting } = useGroup();
  const { loadActiveActivitiesCount, getActiveActivitySubtitle } = useEvaluation();

  const [isModalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    loadCategories(courseId);
  }, [courseId, loadCategories]);

  useEffect(() => {
    categories.forEach((category) => {
      loadActiveActivitiesCount(category.id);
    });
  }, [categories, loadActiveActivitiesCount]);

  const courseCode = courses.find((c) => c.id === courseId)?.code;

  const copyToClipboard = async () => {
    if (courseCode) {
      await Clipboard.setStringAsync(courseCode.toString());
      showAlert('Copiado', 'Código copiado al portapapeles');
    }
  };

  const handleModalCreate = async (file?: DocumentPicker.DocumentPickerAsset) => {
    setModalVisible(false);

    if (!file) return;

    try {
      const response = await fetch(file.uri);
      const csvString = await response.text();

      const success = await importCsvData(courseId, csvString);

      if (success) {
        await loadCategories(courseId);
      }
    } catch (e: any) {
      showAlert('Error', 'No se pudo leer el contenido del archivo CSV');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Appbar.Header style={{ backgroundColor: theme.colors.background }}>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title={courseTitle} titleStyle={styles.appbarTitle} />
      </Appbar.Header>

      <ScrollView contentContainerStyle={styles.content}>
        <Text variant="titleMedium" style={[styles.label, { color: theme.colors.primary }]}>
          Código del curso
        </Text>

        <Surface style={[styles.codeCard, { backgroundColor: theme.colors.surface }]} elevation={2}>
          <Text variant="headlineMedium" style={[styles.codeText, { color: theme.colors.primary }]}>
            {courseCode || '---'}
          </Text>
          <IconButton icon="content-copy" mode="contained-tonal" onPress={copyToClipboard} />
        </Surface>

        <Text
          variant="titleMedium"
          style={[styles.label, { color: theme.colors.primary, marginTop: 30 }]}
        >
          Categorías de Grupos
        </Text>

        {isLoadingCategories || isImporting ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            {isImporting && (
              <Text style={{ marginTop: 10, color: theme.colors.primary, fontWeight: 'bold' }}>
                Importando grupos...
              </Text>
            )}
          </View>
        ) : categories.length === 0 ? (
          <Text style={[styles.emptyText, { color: theme.colors.onSurfaceVariant }]}>
            Este curso no tiene categorías. Toca el botón para importar un CSV.
          </Text>
        ) : (
          categories.map((item) => (
            <View key={item.id} style={styles.categoryWrapper}>
              <CategoryCard
                title={item.name}
                subtitle={getActiveActivitySubtitle(item.id)}
                onTap={() =>
                  navigation.navigate('TeacherCategoryDetail', {
                    categoryId: item.id,
                    categoryName: item.name,
                    courseId,
                    courseTitle,
                  })
                }
              />
            </View>
          ))
        )}
      </ScrollView>

      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.secondary }]}
        color="white"
        disabled={isImporting}
        onPress={() => setModalVisible(true)}
      />

      <CreateCategoryModal
        visible={isModalVisible}
        onDismiss={() => setModalVisible(false)}
        onCreate={handleModalCreate}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  appbarTitle: { fontSize: 18, fontWeight: 'bold' },
  content: { padding: 20, paddingBottom: 100 },
  label: { fontWeight: 'bold', marginBottom: 12, marginLeft: 5 },
  codeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 16,
    marginHorizontal: 10,
  },
  codeText: { fontWeight: 'bold', letterSpacing: 1 },
  emptyText: { textAlign: 'center', marginTop: 20, opacity: 0.7 },
  loadingContainer: { marginTop: 40, alignItems: 'center' },
  categoryWrapper: { marginBottom: 14 },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    borderRadius: 28,
  },
});