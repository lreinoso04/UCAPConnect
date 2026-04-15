import type { CursoResponse } from '../types/api';

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type HomeStackParamList = {
  Dashboard: undefined;
  CoursesList: undefined;
  CourseDetail: { course: CursoResponse };
  CourseEnrollment: { course: CursoResponse };
};

export type MainTabParamList = {
  HomeTab: undefined;
  MyCoursesTab: undefined;
  ScheduleTab: undefined;
  GradesTab: undefined;
  ProfileTab: undefined;
};
