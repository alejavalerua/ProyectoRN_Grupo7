import React, { useState } from "react";
import { View, StyleSheet, ScrollView, ActivityIndicator } from "react-native";
import { Text, FAB, useTheme, IconButton, Badge } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

// Contextos y Componentes
import { useCourse } from "../context/CourseContext";
import { CourseCard, CourseProjectItem } from "../components/CourseCard";
import { AddCourseModal } from "../components/AddCourseModal";
import { useCategory } from "../../../categories/presentation/context/CategoryContext";

// Tipado estricto para la navegación (Ajusta los nombres según tu AppNavigator)
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

  // Consumimos el estado global desde nuestro Contexto
  const { courses, isLoading, joinCourse } = useCourse();
  const {
    loadCategoriesForCourseCardByStudent,
    getCategoryCountText,
    getCourseProjectItems,
  } = useCategory();
  // Estado local para controlar la visibilidad del modal
  const [isModalVisible, setModalVisible] = useState(false);

  // Mock temporal para notificaciones (luego vendrá de su propio Contexto)
  const unreadNotifications = 2;
  // 👇 Efecto reactivo: si los cursos cambian, cargamos sus categorías en background
  React.useEffect(() => {
    courses.forEach((course) => {
      loadCategoriesForCourseCardByStudent(course.id);
    });
  }, [courses, loadCategoriesForCourseCardByStudent]);

  const handleAddCourse = async (code: string) => {
    await joinCourse(code);
    setModalVisible(false);
  };

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* HEADER CON NOTIFICACIONES */}
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

        {/* LISTA DE CURSOS */}
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
              // 👇 1. Las variables DEBEN estar aquí adentro, antes del return
              const progressText = getCategoryCountText(course.id);
              const projects = getCourseProjectItems(course.id);

              return (
                <View key={course.id} style={styles.cardWrapper}>
                  <CourseCard
                    title={course.name}
                    progressText={progressText}
                    leadingIcon="school"
                    projects={projects.map((p) => ({
                      ...p,
                      // 👇 2. Tipado estricto y guion bajo para variables no usadas
                      onTap: (_courseTitle: string, projectTitle: string) => {
                        navigation.navigate("StudentActivities", {
                          categoryId: "TODO-id", // Lo ajustaremos luego
                          categoryName: projectTitle,
                        });
                      },
                    }))}
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

      {/* FLOATING ACTION BUTTON */}
      <FAB
        icon="plus"
        color="white"
        style={[styles.fab, { backgroundColor: theme.colors.secondary }]}
        onPress={() => setModalVisible(true)}
      />

      {/* MODAL PARA AGREGAR CURSO */}
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
    paddingBottom: 100, // Espacio para que el FAB no tape el último curso
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
    borderRadius: 28, // Para hacerlo circular como en Material Design 3
  },
});
