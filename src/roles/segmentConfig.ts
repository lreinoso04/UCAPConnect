import type { ComponentProps } from 'react';
import { Ionicons } from '@expo/vector-icons';

/**
 * Segmentos de producto (documentación) alineados con roles del backend cuando existan.
 * Backend actual: Rol ESTUDIANTE | DOCENTE | ADMIN (UCAPConnect-main).
 * Invitado = público general (sin cuenta). EMPRESA: reservado para cuando exista rol/API.
 */
export type UserSegment = 'invitado' | 'estudiante' | 'docente' | 'admin' | 'empresa';

export type IonName = ComponentProps<typeof Ionicons>['name'];

export function getSegmentDisplayName(segment: UserSegment): string {
  switch (segment) {
    case 'invitado':
      return 'Público general';
    case 'estudiante':
      return 'Estudiante';
    case 'docente':
      return 'Docente';
    case 'admin':
      return 'Administración';
    case 'empresa':
      return 'Empresa';
    default:
      return 'Usuario';
  }
}

export function resolveSegment(isGuest: boolean, rol: string | undefined | null): UserSegment {
  if (isGuest || !rol) return 'invitado';
  const r = String(rol).toUpperCase();
  if (r === 'ESTUDIANTE') return 'estudiante';
  if (r === 'DOCENTE') return 'docente';
  if (r === 'ADMIN') return 'admin';
  if (r === 'EMPRESA') return 'empresa';
  return 'estudiante';
}

export type TabLabels = {
  myCourses: string;
  schedule: string;
  grades: string;
};

export function getTabLabels(segment: UserSegment): TabLabels {
  switch (segment) {
    case 'docente':
      return { myCourses: 'Mis grupos', schedule: 'Calendario', grades: 'Reportes' };
    case 'admin':
      return { myCourses: 'Gestión', schedule: 'Calendario', grades: 'Reportes' };
    case 'empresa':
      return { myCourses: 'Programas', schedule: 'Solicitudes', grades: 'Indicadores' };
    case 'invitado':
    case 'estudiante':
    default:
      return { myCourses: 'Mis cursos', schedule: 'Horario', grades: 'Notas' };
  }
}

export type QuickNav = 'courses' | 'myCourses' | 'schedule' | 'grades';

export type DashboardQuickItem = {
  key: string;
  label: string;
  icon: IonName;
  bg: string;
  nav: QuickNav;
};

export function getDashboardQuickItems(segment: UserSegment): DashboardQuickItem[] {
  switch (segment) {
    case 'invitado':
      return [
        { key: 'cat', label: 'Catálogo', icon: 'school-outline', bg: '#E3F2FD', nav: 'courses' },
        { key: 'evt', label: 'Eventos', icon: 'calendar-outline', bg: '#FFF8E1', nav: 'schedule' },
        { key: 'contact', label: 'Contacto', icon: 'mail-outline', bg: '#E8F5E9', nav: 'grades' },
        { key: 'info', label: 'Más info', icon: 'globe-outline', bg: '#FCE4EC', nav: 'myCourses' },
      ];
    case 'docente':
      return [
        { key: 'cat', label: 'Catálogo', icon: 'school-outline', bg: '#E3F2FD', nav: 'courses' },
        { key: 'mine', label: 'Mis grupos', icon: 'people-outline', bg: '#FFF8E1', nav: 'myCourses' },
        { key: 'sched', label: 'Calendario', icon: 'calendar-outline', bg: '#E8F5E9', nav: 'schedule' },
        { key: 'rep', label: 'Reportes', icon: 'bar-chart-outline', bg: '#FCE4EC', nav: 'grades' },
      ];
    case 'admin':
      return [
        { key: 'cat', label: 'Catálogo', icon: 'school-outline', bg: '#E3F2FD', nav: 'courses' },
        { key: 'mine', label: 'Gestión', icon: 'folder-outline', bg: '#FFF8E1', nav: 'myCourses' },
        { key: 'sched', label: 'Calendario', icon: 'calendar-outline', bg: '#E8F5E9', nav: 'schedule' },
        { key: 'grades', label: 'Reportes', icon: 'ribbon-outline', bg: '#FCE4EC', nav: 'grades' },
      ];
    case 'empresa':
      return [
        { key: 'cat', label: 'Catálogo', icon: 'school-outline', bg: '#E3F2FD', nav: 'courses' },
        { key: 'mine', label: 'Programas', icon: 'folder-outline', bg: '#FFF8E1', nav: 'myCourses' },
        { key: 'sched', label: 'Solicitudes', icon: 'calendar-outline', bg: '#E8F5E9', nav: 'schedule' },
        { key: 'roi', label: 'Indicadores', icon: 'bar-chart-outline', bg: '#FCE4EC', nav: 'grades' },
      ];
    case 'estudiante':
    default:
      return [
        { key: 'cat', label: 'Catálogo', icon: 'school-outline', bg: '#E3F2FD', nav: 'courses' },
        { key: 'mine', label: 'Mis cursos', icon: 'folder-outline', bg: '#FFF8E1', nav: 'myCourses' },
        { key: 'sched', label: 'Horarios', icon: 'calendar-outline', bg: '#E8F5E9', nav: 'schedule' },
        { key: 'grades', label: 'Notas', icon: 'ribbon-outline', bg: '#FCE4EC', nav: 'grades' },
      ];
  }
}

export function getDashboardSubtitle(segment: UserSegment): string {
  switch (segment) {
    case 'invitado':
      return 'Explora programas, eventos y cómo contactarnos.';
    case 'docente':
      return 'Gestión de clases, calendario compartido y reportes.';
    case 'admin':
      return 'Vista operativa; funciones administrativas según políticas.';
    case 'empresa':
      return 'Programas corporativos, solicitudes e indicadores (en evolución).';
    case 'estudiante':
    default:
      return 'Catálogo interactivo, recordatorios y seguimiento académico.';
  }
}

export function getSegmentNeedsLine(segment: UserSegment): string {
  switch (segment) {
    case 'invitado':
      return 'Información general, eventos y contacto directo.';
    case 'estudiante':
      return 'Inscripciones ágiles, horarios, certificados y cobros (según disponibilidad).';
    case 'docente':
      return 'Gestión de clases, materiales y asistencia; calendario y reportes.';
    case 'admin':
      return 'Administración del sistema y soporte a docentes/estudiantes.';
    case 'empresa':
      return 'Cursos corporativos, solicitudes personalizadas e indicadores.';
    default:
      return '';
  }
}

export type PlaceholderKey = 'myCourses' | 'schedule' | 'grades';

export function getFeaturePlaceholder(segment: UserSegment, key: PlaceholderKey): { title: string; description: string } {
  const inv = 'Disponible cuando inicies sesión o cuando el servicio esté activo.';
  if (segment === 'invitado') {
    if (key === 'myCourses') {
      return {
        title: 'Mis cursos',
        description: 'Inicia sesión como estudiante para ver inscripciones y avance. Como invitado puedes explorar el catálogo desde Inicio.',
      };
    }
    if (key === 'schedule') {
      return {
        title: 'Horario y eventos',
        description: 'Aquí podrás ver webinars y fechas relevantes. ' + inv,
      };
    }
    return {
      title: 'Notas y seguimiento',
      description: 'El seguimiento académico requiere cuenta de estudiante. ' + inv,
    };
  }

  if (segment === 'docente') {
    if (key === 'myCourses') {
      return {
        title: 'Mis grupos / clases',
        description: 'Listado de grupos asignados, materiales y control de asistencia cuando el módulo docente esté conectado al backend.',
      };
    }
    if (key === 'schedule') {
      return {
        title: 'Calendario compartido',
        description: 'Sesiones, reuniones y recordatorios con tu equipo académico (próximamente con API).',
      };
    }
    return {
      title: 'Reportes',
      description: 'Reportes de participación y desempeño de grupos (en definición con institución).',
    };
  }

  if (segment === 'admin') {
    if (key === 'myCourses') {
      return { title: 'Gestión académica', description: 'Vista de cursos y grupos para soporte administrativo (endpoints en evolución).' };
    }
    if (key === 'schedule') {
      return { title: 'Calendario institucional', description: 'Eventos y ventanas de capacitación centralizadas.' };
    }
    return { title: 'Reportes', description: 'Indicadores operativos cuando estén expuestos en la API.' };
  }

  if (segment === 'empresa') {
    if (key === 'myCourses') {
      return {
        title: 'Programas corporativos',
        description: 'Catálogo y paquetes para tu organización. Requiere rol empresa en el sistema (próximamente).',
      };
    }
    if (key === 'schedule') {
      return { title: 'Solicitudes', description: 'Seguimiento de solicitudes personalizadas y cotizaciones.' };
    }
    return { title: 'Indicadores / ROI', description: 'Métricas de formación y retorno (definición con negocio).' };
  }

  // estudiante
  if (key === 'myCourses') {
    return {
      title: 'Mis cursos',
      description: 'Inscripciones, avance y materiales cuando el servicio esté activo en el backend.',
    };
  }
  if (key === 'schedule') {
    return { title: 'Horario', description: 'Tus clases y recordatorios en un solo lugar.' };
  }
  return { title: 'Notas', description: 'Calificaciones y progreso académico.' };
}
