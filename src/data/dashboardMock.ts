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
