/** Datos de demostración hasta que existan endpoints de dashboard en el backend */

export const dashboardStats = {
  activeCourses: 3,
  average: 8.5,
  certificates: 4,
};

export const weeklyActivity = [
  { label: 'L', value: 0.45 },
  { label: 'M', value: 0.72 },
  { label: 'X', value: 0.55 },
  { label: 'J', value: 0.9 },
  { label: 'V', value: 0.65 },
  { label: 'S', value: 0.3 },
  { label: 'D', value: 0.25 },
];

export type ContinueCourse = {
  id: string;
  title: string;
  schedule: string;
  facilitator: string;
  progressPct: number;
  progressLabel: string;
};

export const continueCourses: ContinueCourse[] = [
  {
    id: '1',
    title: 'Diplomado - Hemodiálisis y terapia de reemplazo renal',
    schedule: 'Viernes 7:00 - 10:00 p. m. · Virtual',
    facilitator: 'Ing. Pedro Milano',
    progressPct: 75,
    progressLabel: 'Progreso - Módulo 7 de 12 - Equipos HD',
  },
  {
    id: '2',
    title: 'Inteligencia Artificial aplicada a la Docencia',
    schedule: 'Disponible 24/7 · Virtual',
    facilitator: 'Dra. Carmen Lugo',
    progressPct: 50,
    progressLabel: 'Progreso - Módulo 4 de 8 - Evaluación formativa',
  },
];

export type UpcomingEvent = {
  id: string;
  day: string;
  month: string;
  timeRange: string;
  tag: string;
  title: string;
  facilitator: string;
  locationLine: string;
};

export const upcomingEvents: UpcomingEvent[] = [
  {
    id: '1',
    day: '19',
    month: 'Mar',
    timeRange: '7:00 pm a 9:00 pm',
    tag: 'Clase de diplomado',
    title: 'Liderazgo Estratégico y Toma de Decisiones',
    facilitator: 'Facilitadora: Lic. Ana Peralta',
    locationLine: 'Virtual · Santo Domingo',
  },
];

export const promoBanner = {
  title: '¡Nuevo Diplomado disponible!',
  subtitle: 'Gestión Empresarial y Liderazgo',
};
