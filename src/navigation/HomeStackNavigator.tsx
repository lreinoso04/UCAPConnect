import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { DashboardScreen } from '../screens/DashboardScreen';
import { CoursesScreen } from '../screens/CoursesScreen';
import { CourseDetailScreen } from '../screens/CourseDetailScreen';
import { CourseEnrollmentScreen } from '../screens/CourseEnrollmentScreen';
import { CartScreen } from '../screens/CartScreen';
import { NotificationsScreen } from '../screens/NotificationsScreen';
import { colors, typography } from '../theme';
import type { HomeStackParamList } from './types';

import { useAuth } from '../context/AuthContext';

const Stack = createNativeStackNavigator<HomeStackParamList>();

export function HomeStackNavigator() {
  const { isGuest } = useAuth();
  return (
    <Stack.Navigator
      initialRouteName={isGuest ? 'CoursesList' : 'Dashboard'}
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
      <Stack.Screen name="Cart" component={CartScreen} options={{ headerShown: true, title: 'Tu Carrito' }} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}
