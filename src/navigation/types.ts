import type { CursoResponse } from '../types/api';

export type AuthStackParamList = {
  CoursesList: undefined;
  CourseDetail: { course: CursoResponse };
  Login: undefined;
  Register: undefined;
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
