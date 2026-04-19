import type { CursoResponse } from '../types/api';

export type AuthStackParamList = {
  CoursesList: undefined;
  CourseDetail: { course: CursoResponse };
  Login: { emailConfirmed?: string } | undefined;
  Register: undefined;
  ConfirmEmail: { status: 'success' | 'error' };
};

export type HomeStackParamList = {
  Dashboard: undefined;
  CoursesList: undefined;
  CourseDetail: { course: CursoResponse };
  CourseEnrollment: { course: CursoResponse };
  Cart: undefined;
  Notifications: undefined;
};

export type MainTabParamList = {
  HomeTab: undefined;
  MyCoursesTab: undefined;
  ScheduleTab: undefined;
  CartTab: undefined;
  ProfileTab: undefined;
};
