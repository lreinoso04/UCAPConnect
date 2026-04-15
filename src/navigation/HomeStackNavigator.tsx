import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { DashboardScreen } from '../screens/DashboardScreen';
import { CoursesScreen } from '../screens/CoursesScreen';
import { CourseDetailScreen } from '../screens/CourseDetailScreen';
import { CourseEnrollmentScreen } from '../screens/CourseEnrollmentScreen';
import { colors, typography } from '../theme';
import type { HomeStackParamList } from './types';

const Stack = createNativeStackNavigator<HomeStackParamList>();

export function HomeStackNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Dashboard"
      screenOptions={{
        headerStyle: { backgroundColor: colors.heroNavy },
        headerTintColor: colors.onPrimary,
        headerTitleStyle: { fontWeight: typography.weight.semibold },
        contentStyle: { backgroundColor: colors.surface },
      }}
    >
      <Stack.Screen name="Dashboard" component={DashboardScreen} options={{ headerShown: false }} />
      <Stack.Screen name="CoursesList" component={CoursesScreen} options={{ headerShown: false }} />
      <Stack.Screen name="CourseDetail" component={CourseDetailScreen} options={{ headerShown: false }} />
      <Stack.Screen name="CourseEnrollment" component={CourseEnrollmentScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}
