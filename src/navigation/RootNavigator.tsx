import React, { useEffect, useRef } from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, StyleSheet, View, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as SplashScreen from 'expo-splash-screen';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import { getTabLabels, resolveSegment } from '../roles/segmentConfig';
import { colors, typography } from '../theme';
import type { AuthStackParamList, MainTabParamList } from './types';
import { HomeStackNavigator } from './HomeStackNavigator';

import { LoginScreen } from '../screens/LoginScreen';
import { RegisterScreen } from '../screens/RegisterScreen';
import { ConfirmEmailScreen } from '../screens/ConfirmEmailScreen';
import { ForgotPasswordScreen } from '../screens/ForgotPasswordScreen';
import { ResetPasswordScreen } from '../screens/ResetPasswordScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { CoursesScreen } from '../screens/CoursesScreen';
import { CourseDetailScreen } from '../screens/CourseDetailScreen';
import { MyCoursesScreen } from '../screens/MyCoursesScreen';
import { ScheduleScreen } from '../screens/ScheduleScreen';
import { CartScreen } from '../screens/CartScreen';
import { ChatProvider } from '@/context/ChatContext';
import { ChatButton } from '@/components/chatbot/ChatButton';
import { ChatWindow } from '@/components/chatbot/ChatWindow';
import { CartProvider } from '@/context/CartContext';
import { Text } from 'react-native';
const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

const tabIconStyles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'flex-start' },
  indicator: {
    width: 28,
    height: 3,
    borderRadius: 2,
    marginBottom: 4,
    backgroundColor: 'transparent',
  },
  indicatorOn: {
    backgroundColor: colors.accent,
  },
});

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.surface,
    primary: colors.primary,
  },
};

function AuthNavigator() {
  return (
    <AuthStack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.card },
      }}
    >
      <AuthStack.Screen name="CoursesList" component={CoursesScreen} />
      <AuthStack.Screen name="CourseDetail" component={CourseDetailScreen} />
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen
        name="Register"
        component={RegisterScreen}
        options={{
          headerShown: true,
          headerStyle: { backgroundColor: colors.primary },
          headerTintColor: colors.onPrimary,
          title: 'Registro',
        }}
      />
      <AuthStack.Screen
        name="ConfirmEmail"
        component={ConfirmEmailScreen}
        options={{
          headerShown: false,
        }}
      />
      <AuthStack.Screen
        name="ForgotPassword"
        component={ForgotPasswordScreen}
        options={{
          headerShown: false,
        }}
      />
      <AuthStack.Screen
        name="ResetPassword"
        component={ResetPasswordScreen}
        options={{
          headerShown: false,
        }}
      />
    </AuthStack.Navigator>
  );
}

function ChatContent() {
  const { isOpen, toggleChat, messages, isLoading, sendMessage } = useChat();

  return (
    <>
      <ChatButton
        isOpen={isOpen}
        onToggle={toggleChat}
        isLoading={isLoading}
      />
      <ChatWindow
        visible={isOpen}
        messages={messages}
        isLoading={isLoading}
        onClose={toggleChat}
        onSendMessage={sendMessage}
      />
    </>
  );
}

function MainTabs() {
  const { user } = useAuth();
  const tabLabels = getTabLabels(resolveSegment(false, user?.rol));

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: route.name === 'CartTab',
        headerStyle: { backgroundColor: colors.primary, height: 125 },
        headerTitleAlign: 'left',
        headerTintColor: colors.onPrimary,
        headerTitleStyle: { fontWeight: typography.weight.semibold},
        headerTitle: () => (
          <View>
            <Text style={{ color: colors.onPrimary, fontSize: 23, fontWeight: '700' }}>
              Carrito
            </Text>

            <Text style={{ color: colors.onPrimary, fontSize: 13, opacity: 0.8, paddingTop:2 }}>
              Revisa tus cursos seleccionados
            </Text>
          </View>
        ),
        tabBarActiveTintColor: colors.heroNavy,
        tabBarInactiveTintColor: '#475569',
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          paddingTop: 6,
          height: 62,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        tabBarIcon: ({ color, size, focused }) => {
          const r = route.name;
          let name = 'home-outline' as keyof typeof Ionicons.glyphMap;
          if (r === 'HomeTab') name = focused ? 'home' : 'home-outline';
          else if (r === 'MyCoursesTab') name = focused ? 'book' : 'book-outline';
          else if (r === 'ScheduleTab') name = focused ? 'calendar' : 'calendar-outline';
          else if (r === 'CartTab') name = focused ? 'cart' : 'cart-outline';
          else name = focused ? 'person' : 'person-outline';
          return (
            <View style={tabIconStyles.wrap}>
              <View style={[tabIconStyles.indicator, focused && tabIconStyles.indicatorOn]} />
              <Ionicons name={name} size={size} color={color} />
            </View>
          );
        },
      })}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeStackNavigator}
        options={{ title: 'Inicio', headerShown: false }}
      />
      <Tab.Screen
        name="MyCoursesTab"
        component={MyCoursesScreen}
        options={{ title: tabLabels.myCourses, tabBarLabel: tabLabels.myCourses }}
      />
      <Tab.Screen
        name="ScheduleTab"
        component={ScheduleScreen}
        options={{ title: tabLabels.schedule, tabBarLabel: tabLabels.schedule }}
      />
      <Tab.Screen
        name="CartTab"
        component={CartScreen}
        options={{ title: 'Carrito', tabBarLabel: 'Carrito' }}
        listeners={{
          tabPress: (e) => {
            if (!user) {
              e.preventDefault();
            }
          }
        }}
      />
      <Tab.Screen name="ProfileTab" component={ProfileScreen} options={{ title: 'Perfil' }} />
    </Tab.Navigator>
  );
}

export function RootNavigator() {
  const { user, ready } = useAuth();

  useEffect(() => {
    if (ready) {
      SplashScreen.hideAsync();
    }
  }, [ready]);

  if (!ready) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.surface }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const inApp = user != null;

  const linking = {
    prefixes: ['ucapconnect://'],
    config: {
      screens: {
        Login: 'login',
        ConfirmEmail: 'confirm-email',
        ResetPassword: 'reset-password',
      },
    },
  };
  return (
    <CartProvider>
      <ChatProvider>
        <View style={{ flex: 1 }}>
          <NavigationContainer theme={navTheme} linking={linking}>
            {inApp ? <MainTabs /> : <AuthNavigator />}
          </NavigationContainer>

          <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'box-none' }}>
            <ChatContent />
          </View>
        </View>
      </ChatProvider>
    </CartProvider>
  );
}