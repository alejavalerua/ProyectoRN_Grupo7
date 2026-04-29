import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Text, useTheme, Appbar } from 'react-native-paper';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useCategory } from '../context/CategoryContext';
import { CategoryCard } from '../components/CategoryCard';
import { useEvaluation } from '../../../evaluations/presentation/context/EvaluationContext';

export default function StudentCourseDetailScreen() {
  const theme = useTheme();
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { courseId, courseTitle } = route.params;

  const { categories, isLoading, loadCategoriesByStudent } = useCategory();
  const { loadPendingActivitiesCount, getPendingActivitySubtitle } = useEvaluation();

  const loadedPendingByCategoryRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    loadCategoriesByStudent(courseId);
  }, [courseId, loadCategoriesByStudent]);

  useEffect(() => {
    categories.forEach((category) => {
      if (!loadedPendingByCategoryRef.current.has(category.id)) {
        loadedPendingByCategoryRef.current.add(category.id);
        loadPendingActivitiesCount(category.id);
      }
    });
  }, [categories, loadPendingActivitiesCount]);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Appbar.Header style={{ backgroundColor: theme.colors.background }}>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title={courseTitle} titleStyle={styles.appbarTitle} />
        <Appbar.Action
          icon="bell-outline"
          onPress={() => navigation.navigate('Notifications')}
        />
      </Appbar.Header>

      <ScrollView contentContainerStyle={styles.content}>
        <Text
          variant="titleMedium"
          style={[styles.sectionTitle, { color: theme.colors.primary }]}
        >
          Categorías de Grupos
        </Text>

        {isLoading ? (
          <ActivityIndicator
            style={{ marginTop: 20 }}
            color={theme.colors.primary}
          />
        ) : (
          categories.map((item) => (
            <CategoryCard
              key={item.id}
              title={item.name}
              subtitle={getPendingActivitySubtitle(item.id)}
              onTap={() =>
                navigation.navigate('StudentActivities', {
                  categoryId: item.id,
                  categoryName: item.name,
                })
              }
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  appbarTitle: { fontSize: 18, fontWeight: 'bold' },
  content: { padding: 20 },
  sectionTitle: { fontWeight: 'bold', marginBottom: 20, marginLeft: 10 },
});