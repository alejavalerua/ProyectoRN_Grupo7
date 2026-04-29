import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import StudentCoursesScreen from '../features/courses/presentation/screens/StudentCoursesScreen';
import StudentCourseDetailScreen from '../features/categories/presentation/screens/StudentCourseDetailScreen';
import StudentActivitiesScreen from '../features/evaluations/presentation/screens/StudentActivitiesScreen';
import StudentEvaluationScreen from '../features/evaluations/presentation/screens/StudentEvaluationScreen';

const Stack = createNativeStackNavigator();

export default function StudentCoursesStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="StudentCourses" component={StudentCoursesScreen} />
      <Stack.Screen
        name="StudentCourseDetail"
        component={StudentCourseDetailScreen}
      />
      <Stack.Screen
        name="StudentActivities"
        component={StudentActivitiesScreen}
      />
      <Stack.Screen
        name="StudentEvaluation"
        component={StudentEvaluationScreen}
      />
    </Stack.Navigator>
  );
}