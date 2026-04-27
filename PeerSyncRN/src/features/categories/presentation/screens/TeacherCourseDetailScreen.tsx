import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Text, useTheme, Appbar, FAB, Surface, IconButton } from 'react-native-paper';
import { useRoute, useNavigation } from '@react-navigation/native';
import * as Clipboard from 'expo-clipboard'; 

import { useCategory } from '../context/CategoryContext';
import { useCourse } from '../../../courses/presentation/context/CourseContext';
import { CategoryCard } from '../components/CategoryCard';
import { CreateCategoryModal } from '../components/CreateCategoryModal';
import { showAlert } from '../../../../core/utils/alerts';

export default function TeacherCourseDetailScreen() {
  const theme = useTheme();
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { courseId, courseTitle } = route.params;

  const { categories, isLoading, loadCategories } = useCategory();
  const { courses } = useCourse();
  
  const [isModalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    loadCategories(courseId);
  }, [courseId, loadCategories]);

  // Obtener el código del curso actual
  const courseCode = courses.find(c => c.id === courseId)?.code;

  const copyToClipboard = async () => {
    if (courseCode) {
      await Clipboard.setStringAsync(courseCode.toString());
      showAlert('Copiado', 'Código copiado al portapapeles');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Appbar.Header style={{ backgroundColor: theme.colors.background }}>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title={courseTitle} titleStyle={styles.appbarTitle} />
      </Appbar.Header>

      <ScrollView contentContainerStyle={styles.content}>
        {/* SECCIÓN DEL CÓDIGO DEL CURSO */}
        <Text variant="titleMedium" style={[styles.label, { color: theme.colors.primary }]}>
          Código del curso
        </Text>
        <Surface style={[styles.codeCard, { backgroundColor: theme.colors.surface }]} elevation={2}>
          <Text variant="headlineMedium" style={[styles.codeText, { color: theme.colors.primary }]}>
            {courseCode || '---'}
          </Text>
          <IconButton icon="content-copy" mode="contained-tonal" onPress={copyToClipboard} />
        </Surface>

        {/* SECCIÓN DE CATEGORÍAS */}
        <Text variant="titleMedium" style={[styles.label, { color: theme.colors.primary, marginTop: 30 }]}>
          Categorías de Grupos
        </Text>

        {isLoading ? (
          <ActivityIndicator style={{ marginTop: 20 }} color={theme.colors.primary} />
        ) : categories.length === 0 ? (
          <Text style={styles.emptyText}>Este curso no tiene categorías</Text>
        ) : (
          categories.map((item) => (
            <CategoryCard
              key={item.id}
              title={item.name}
              subtitle="Ver reportes y actividades"
              onTap={() => navigation.navigate('TeacherCategoryDetail', { categoryId: item.id, categoryName: item.name })}
            />
          ))
        )}
      </ScrollView>

      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.secondary }]}
        color="white"
        onPress={() => setModalVisible(true)}
      />

      <CreateCategoryModal 
        visible={isModalVisible} 
        onDismiss={() => setModalVisible(false)} 
        onCreate={(file) => {
          setModalVisible(false);
          showAlert('Éxito', 'Iniciando importación de grupos...');
        }} 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  appbarTitle: { fontSize: 18, fontWeight: 'bold' },
  content: { padding: 20 },
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
  emptyText: { textAlign: 'center', marginTop: 20, opacity: 0.6 },
  fab: { position: 'absolute', margin: 16, right: 0, bottom: 0, borderRadius: 28 },
});