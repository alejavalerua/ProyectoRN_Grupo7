import React, { useEffect, useRef, useState } from "react";
import { View, StyleSheet, ScrollView, ActivityIndicator } from "react-native";
import { Text, FAB, useTheme, IconButton, Badge } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { useCourse } from "../context/CourseContext";
import { CourseCard } from "../components/CourseCard";
import { AddCourseModal } from "../components/AddCourseModal";
import { useCategory } from "../../../categories/presentation/context/CategoryContext";
import { useEvaluation } from "../../../evaluations/presentation/context/EvaluationContext";

type RootStackParamList = {
  StudentCourses: undefined;
  Notifications: undefined;
  StudentCourseDetail: { courseId: string; courseTitle: string };
  StudentActivities: { categoryId: string; categoryName: string };
};

type NavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "StudentCourses"
>;

export default function StudentCoursesScreen() {
  const theme = useTheme();
  const navigation = useNavigation<NavigationProp>();

  const { courses, isLoading, joinCourse } = useCourse();
  const {
    loadCategoriesForCourseCardByStudent,
    getCategoryCountText,
    getCategoriesPreview,
  } = useCategory();
  const { loadPendingActivitiesCount, getPendingActivitySubtitle } =
    useEvaluation();

  const [isModalVisible, setModalVisible] = useState(false);
  const unreadNotifications = 2;

  const loadedCoursesRef = useRef<Set<string>>(new Set());
  const loadedPendingByCategoryRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    courses.forEach((course) => {
      if (!loadedCoursesRef.current.has(course.id)) {
        loadedCoursesRef.current.add(course.id);
        loadCategoriesForCourseCardByStudent(course.id);
      }
    });
  }, [courses, loadCategoriesForCourseCardByStudent]);

  useEffect(() => {
    courses.forEach((course) => {
      const categories = getCategoriesPreview(course.id);

      categories.forEach((category) => {
        if (!loadedPendingByCategoryRef.current.has(category.id)) {
          loadedPendingByCategoryRef.current.add(category.id);
          loadPendingActivitiesCount(category.id);
        }
      });
    });
  }, [courses, getCategoriesPreview, loadPendingActivitiesCount]);

  const handleAddCourse = async (code: string) => {
    await joinCourse(code);

    loadedCoursesRef.current.clear();
    loadedPendingByCategoryRef.current.clear();

    setModalVisible(false);
  };

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
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
              onPress={() => navigation.navigate("Notifications")}
            />
            {unreadNotifications > 0 && (
              <Badge style={styles.badge} size={18}>
                {unreadNotifications}
              </Badge>
            )}
          </View>
        </View>

        {isLoading ? (
          <View style={styles.centerContent}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
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
              No estás inscrito en ningún curso
            </Text>
          </View>
        ) : (
          <View style={styles.coursesList}>
            {courses.map((course) => {
              const progressText = getCategoryCountText(course.id);
              const categories = getCategoriesPreview(course.id);

              const projects = categories.slice(0, 3).map((category) => ({
                title: category.name,
                subtitle: getPendingActivitySubtitle(category.id),
                onTap: () => {
                  navigation.navigate("StudentActivities", {
                    categoryId: category.id,
                    categoryName: category.name,
                  });
                },
              }));

              return (
                <View key={course.id} style={styles.cardWrapper}>
                  <CourseCard
                    title={course.name}
                    progressText={progressText}
                    leadingIcon="school"
                    projects={projects}
                    onTap={() => {
                      navigation.navigate("StudentCourseDetail", {
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

      <AddCourseModal
        visible={isModalVisible}
        onDismiss={() => setModalVisible(false)}
        onAdd={handleAddCourse}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
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