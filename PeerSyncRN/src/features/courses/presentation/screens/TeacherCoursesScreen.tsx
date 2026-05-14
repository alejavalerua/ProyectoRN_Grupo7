import React, { useState, useRef, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Text, FAB, useTheme, IconButton, Badge } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { useCourse } from "../context/CourseContext";
import { CourseCard, CourseProjectItem } from "../components/CourseCard";
import { CreateCourseModal } from "../components/CreateCourseModal";
import { showAlert } from "@/src/core/utils/alerts";
import { useCategory } from "../../../categories/presentation/context/CategoryContext";
import { useEvaluation } from "../../../evaluations/presentation/context/EvaluationContext";
import { useGroup } from "../../../groups/presentation/context/GroupContext";

type RootStackParamList = {
  TeacherCourses: undefined;
  Notifications: undefined;
  TeacherCourseDetail: { courseId: string; courseTitle: string };
  TeacherCategoryDetail: {
    categoryId: string;
    categoryName: string;
    courseId: string;
    courseTitle: string;
  };
};

type NavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "TeacherCourses"
>;

export default function TeacherCoursesScreen() {
  const theme = useTheme();
  const navigation = useNavigation<NavigationProp>();

  const { courses, isLoading, createCourse } = useCourse();
  const { importCsvData } = useGroup();
  const {
    loadCategoriesForCourseCard,
    getCategoryCountText,
    getCategoriesPreview,
  } = useCategory();
  const {
    loadActiveActivitiesCount,
    getActiveActivitySubtitle,
  } = useEvaluation();

  const [isModalVisible, setModalVisible] = useState(false);
  const [isProcessingCsv, setIsProcessingCsv] = useState(false);

  const unreadNotifications = 3;

  const loadedCoursesRef = useRef<Set<string>>(new Set());
  const loadedActiveCountsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    courses.forEach((course) => {
      if (!loadedCoursesRef.current.has(course.id)) {
        loadedCoursesRef.current.add(course.id);
        loadCategoriesForCourseCard(course.id);
      }
    });
  }, [courses, loadCategoriesForCourseCard]);

  useEffect(() => {
    courses.forEach((course) => {
      const categories = getCategoriesPreview(course.id);

      categories.forEach((category) => {
        if (!loadedActiveCountsRef.current.has(category.id)) {
          loadedActiveCountsRef.current.add(category.id);
          loadActiveActivitiesCount(category.id);
        }
      });
    });
  }, [courses, getCategoriesPreview, loadActiveActivitiesCount]);

  const handleCreateCourse = async (name: string, fileUri?: string) => {
    setModalVisible(false);
    setIsProcessingCsv(true);

    try {
      const newCourseId = await createCourse(name);

      if (newCourseId && fileUri) {
        const response = await fetch(fileUri);
        const csvString = await response.text();

        const success = await importCsvData(newCourseId, csvString);

        if (!success) {
          showAlert(
            "Advertencia",
            "El curso fue creado, pero no se pudo importar el CSV."
          );
        }
      }
    } catch (error: any) {
      showAlert(
        "Error de Registro",
        error.message || "Ocurrió un error al crear el curso"
      );
    } finally {
      setIsProcessingCsv(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text
            variant="titleLarge"
            style={{ color: theme.colors.primary, fontWeight: "bold" }}
          >
            Cursos
          </Text>

          <View>
            <IconButton
              icon="bell-outline"
              iconColor={theme.colors.primary}
              size={28}
              onPress={() => navigation.getParent()?.navigate("Notifications")}
            />
            {unreadNotifications > 0 && (
              <Badge style={styles.badge} size={18}>
                {unreadNotifications}
              </Badge>
            )}
          </View>
        </View>

        {isLoading || isProcessingCsv ? (
          <View style={styles.centerContent}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            {isProcessingCsv && (
              <Text
                variant="bodyMedium"
                style={{ marginTop: 10, color: theme.colors.primary }}
              >
                Configurando curso y procesando estudiantes...
              </Text>
            )}
          </View>
        ) : courses.length === 0 ? (
          <View style={styles.centerContent}>
            <Text
              variant="bodyLarge"
              style={{
                color: theme.colors.onSurfaceVariant,
                textAlign: "center",
              }}
            >
              No has creado ningún curso
            </Text>
          </View>
        ) : (
          <View style={styles.coursesList}>
            {courses.map((course) => {
              const categories = getCategoriesPreview(course.id);

              const projects: CourseProjectItem[] = categories.map((category) => ({
                title: category.name,
                subtitle: getActiveActivitySubtitle(category.id),
                onTap: () => {
                  navigation.navigate("TeacherCategoryDetail", {
                    categoryId: category.id,
                    categoryName: category.name,
                    courseId: course.id,
                    courseTitle: course.name,
                  });
                },
              }));

              return (
                <View key={course.id} style={styles.cardWrapper}>
                  <CourseCard
                    title={course.name}
                    progressText={getCategoryCountText(course.id)}
                    leadingIcon="school"
                    projects={projects}
                    onTap={() => {
                      navigation.navigate("TeacherCourseDetail", {
                        courseId: course.id,
                        courseTitle: course.name,
                      });
                    }}
                  />
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>

      <FAB
        icon="plus"
        color="white"
        style={[styles.fab, { backgroundColor: theme.colors.secondary }]}
        onPress={() => setModalVisible(true)}
      />

      <CreateCourseModal
        visible={isModalVisible}
        onDismiss={() => setModalVisible(false)}
        onCreate={handleCreateCourse}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: {
    paddingTop: 40,
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  badge: {
    position: "absolute",
    top: 4,
    right: 4,
  },
  centerContent: {
    marginTop: 40,
    alignItems: "center",
  },
  coursesList: {
    width: "100%",
  },
  cardWrapper: {
    marginBottom: 16,
  },
  fab: {
    position: "absolute",
    margin: 20,
    right: 0,
    bottom: 0,
    borderRadius: 28,
  },
});