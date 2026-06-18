import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { DashboardScreen } from '../screens/DashboardScreen';
import { CoursesScreen } from '../screens/CoursesScreen';
import { CourseDetailScreen } from '../screens/CourseDetailScreen';
import { CourseEnrollmentScreen } from '../screens/CourseEnrollmentScreen';
import { NotificationsScreen } from '../screens/NotificationsScreen';
import { CatalogScreen } from '../screens/CatalogScreen';
import { CatalogDetailScreen } from '../screens/CatalogDetailScreen';
import { ScheduleScreen } from '../screens/ScheduleScreen';
import { colors, typography } from '../theme';
import type { HomeStackParamList } from './types';
import { useAuth } from '../context/AuthContext';

const Stack = createNativeStackNavigator<HomeStackParamList>();

export function HomeStackNavigator({ route }: any) {
  const { user } = useAuth();
  const isGuest = !user;

  const initialRoute =
    route?.params?.screen ?? (isGuest ? 'CoursesList' : 'Dashboard');

  return (
    <Stack.Navigator
      initialRouteName={initialRoute}
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
      <Stack.Screen name="Notifications" component={NotificationsScreen} options={{ headerShown: false }} />

      {/* CATÁLOGO */}
      <Stack.Screen name="Catalog" component={CatalogScreen} options={{ headerShown: false }} />
      <Stack.Screen name="CatalogDetails" component={CatalogDetailScreen} options={{ headerShown: false }} />

      <Stack.Screen name="ScheduleTab" component={ScheduleScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}