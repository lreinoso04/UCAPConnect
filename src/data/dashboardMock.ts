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
  {
    id: '3',
    title: 'Taller - Ciberseguridad para Redes Empresariales',
    schedule: 'Sábados de 9:00 a. m. a 12:00 p. m. · Virtual',
    facilitator: 'Mtro. Luis Fernández',
    progressPct: 20,
    progressLabel: 'Progreso - Módulo 2 de 5 - Amenazas comunes',
  },
  {
    id: '4',
    title: 'Especialidad - Gestión y Dirección de Centros Educativos',
    schedule: 'Miércoles y Viernes 6:00 - 9:00 p. m. · Híbrido',
    facilitator: 'Dra. Josefina Marte',
    progressPct: 90,
    progressLabel: 'Progreso - Proyecto final',
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
  {
    id: '2',
    day: '21',
    month: 'Mar',
    timeRange: '9:00 am a 12:00 pm',
    tag: 'Clase de taller',
    title: 'Ciberseguridad Práctica',
    facilitator: 'Mtro. Luis Fernández',
    locationLine: 'Presencial · Recinto Santiago',
  },
  {
    id: '3',
    day: '23',
    month: 'Mar',
    timeRange: '6:00 pm a 8:00 pm',
    tag: 'Tutoría grupal',
    title: 'Revisión y avance de Proyecto Final',
    facilitator: 'Dra. Josefina Marte',
    locationLine: 'Virtual · Teams',
  },
  {
    id: '4',
    day: '25',
    month: 'Mar',
    timeRange: '10:00 am a 11:30 am',
    tag: 'Webinar gratuito',
    title: 'Novedades de la Gestión Educativa',
    facilitator: 'Panel de Expertos',
    locationLine: 'YouTube Live',
  },
];

export const promoBanner = {
  title: '¡Nuevo Diplomado disponible!',
  subtitle: 'Gestión Empresarial y Liderazgo',
};
