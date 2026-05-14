import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import TeacherCoursesScreen from '../features/courses/presentation/screens/TeacherCoursesScreen';
import TeacherCourseDetailScreen from '../features/categories/presentation/screens/TeacherCourseDetailScreen';
import TeacherCategoryDetailScreen from '../features/categories/presentation/screens/TeacherCategoryDetailScreen';
import TeacherReportScreen from '../features/evaluations/presentation/screens/TeacherReportScreen';

const Stack = createNativeStackNavigator();

export default function TeacherCoursesStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="TeacherCourses" component={TeacherCoursesScreen} />
      <Stack.Screen
        name="TeacherCourseDetail"
        component={TeacherCourseDetailScreen}
      />
      <Stack.Screen
        name="TeacherCategoryDetail"
        component={TeacherCategoryDetailScreen}
      />
      <Stack.Screen
        name="TeacherReport"
        component={TeacherReportScreen}
      />
    </Stack.Navigator>
  );
}