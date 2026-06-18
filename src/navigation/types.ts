import type { CursoResponse } from '../types/api';

export type AuthStackParamList = {
  CoursesList: undefined;
  CourseDetail: { course: CursoResponse };
  Login: { emailConfirmed?: string } | undefined;
  Register: undefined;
  ConfirmEmail: { status: 'success' | 'error' };
  ForgotPassword: undefined;
  ResetPassword: { token: string };
};

export type HomeStackParamList = {
  Dashboard: undefined;
  CoursesList: undefined;
  CourseDetail: { course: CursoResponse };
  CourseEnrollment: { course: CursoResponse };
  Cart: undefined;
  Notifications: undefined;
  ScheduleTab: undefined;
  Catalog: undefined;
  CatalogDetails: { id: string }; 
};

export type MainTabParamList = {
  HomeTab: undefined;
  MyCoursesTab: undefined;
  CatalogTab: undefined;
  CartTab: undefined;
  ProfileTab: undefined;
};
