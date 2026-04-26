import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { Text, FAB, useTheme, IconButton, Badge } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

// Contextos y Componentes
import { useCourse } from '../context/CourseContext';
import { CourseCard, CourseProjectItem } from '../components/CourseCard';
import { CreateCourseModal } from '../components/CreateCourseModal';
import { showAlert } from '@/src/core/utils/alerts';

// Tipado estricto para la navegación
type RootStackParamList = {
  TeacherCourses: undefined;
  Notifications: undefined;
  TeacherCourseDetail: { courseId: string; courseTitle: string };
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'TeacherCourses'>;

export default function TeacherCoursesScreen() {
  const theme = useTheme();
  const navigation = useNavigation<NavigationProp>();
  
  // Consumimos el estado global desde nuestro Contexto
  const { courses, isLoading, createCourse } = useCourse();

  // Estado local para el modal y para un overlay de carga propio al crear cursos masivos
  const [isModalVisible, setModalVisible] = useState(false);
  const [isProcessingCsv, setIsProcessingCsv] = useState(false);

  // Mock temporal para notificaciones
  const unreadNotifications = 3; 

  const handleCreateCourse = async (name: string, fileUri?: string) => {
    setModalVisible(false); // Cerramos el modal
    setIsProcessingCsv(true); // Mostramos carga en la pantalla

    try {
      const newCourseId = await createCourse(name);

      if (newCourseId) {
        if (fileUri) {
          // TODO: Aquí llamaremos al GroupsContext en el futuro para subir el CSV
          // await groupsContext.importCsvData(newCourseId, fileUri);
          console.log(`Simulando subida de CSV para el curso ${newCourseId}`);
        }
      }
    } catch (error: any) {
      showAlert("Error de Registro", error.message || "Ocurrió un error al crear el curso");
    } finally {
      setIsProcessingCsv(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* HEADER CON NOTIFICACIONES */}
        <View style={styles.header}>
          <Text variant="titleLarge" style={{ color: theme.colors.primary, fontWeight: 'bold' }}>
            Cursos
          </Text>
          <View>
            <IconButton
              icon="bell-outline"
              iconColor={theme.colors.primary}
              size={28}
              onPress={() => navigation.navigate('Notifications')}
            />
            {unreadNotifications > 0 && (
              <Badge style={styles.badge} size={18}>
                {unreadNotifications}
              </Badge>
            )}
          </View>
        </View>

        {/* LISTA DE CURSOS */}
        {isLoading || isProcessingCsv ? (
          <View style={styles.centerContent}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            {isProcessingCsv && (
              <Text variant="bodyMedium" style={{ marginTop: 10, color: theme.colors.primary }}>
                Configurando curso y procesando estudiantes...
              </Text>
            )}
          </View>
        ) : courses.length === 0 ? (
          <View style={styles.centerContent}>
            <Text variant="bodyLarge" style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center' }}>
              No has creado ningún curso
            </Text>
          </View>
        ) : (
          <View style={styles.coursesList}>
            {courses.map((course) => {
              //TODO: Estos datos vendrán del CategoryContext y EvaluationContext en el futuro
              const progressText = "15 estudiantes inscritos"; // MOCK
              
              const projects: CourseProjectItem[] = [
                {
                  title: "Proyecto Final", // MOCK
                  subtitle: "10/15 Entregas calificadas", // MOCK
                  onTap: (courseTitle, projectTitle) => {
                    navigation.navigate('TeacherCourseDetail', {
                      courseId: course.id,
                      courseTitle: course.name,
                    });
                  },
                }
              ];

              return (
                <View key={course.id} style={styles.cardWrapper}>
                  <CourseCard
                    title={course.name}
                    progressText={progressText}
                    leadingIcon="school"
                    projects={projects}
                    onTap={() => {
                      navigation.navigate('TeacherCourseDetail', {
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

      {/* MODAL PARA CREAR CURSO */}
      <CreateCourseModal
        visible={isModalVisible}
        onDismiss={() => setModalVisible(false)}
        onCreate={handleCreateCourse}
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
    paddingBottom: 100, // Espacio para que el FAB no tape contenido
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
  },
  centerContent: {
    marginTop: 40,
    alignItems: 'center',
  },
  coursesList: {
    width: '100%',
  },
  cardWrapper: {
    marginBottom: 16,
  },
  fab: {
    position: 'absolute',
    margin: 20,
    right: 0,
    bottom: 0,
    borderRadius: 28,
  },
});