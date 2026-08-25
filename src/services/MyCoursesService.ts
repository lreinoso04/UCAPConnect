import { API_BASE_URL } from '@/config';
import { loadAuth } from '../storage/authStorage';

export interface MyCourse {
  cursoExternoId: string;
  nombre: string;
  horario: string;
  descripcion: string;
  facilitador: string;
  estado: 'PENDIENTE' | 'EN_PROGRESO' | 'COMPLETADO' | string;
  id: string;

  // Temporal: posteriormente vendrá del backend
  progressPct?: number;
}

class MyCoursesService {
  async getMyCourses(): Promise<MyCourse[]> {
    const auth = await loadAuth();

    if (!auth?.token) {
      throw new Error('Usuario no autenticado');
    }

    const response = await fetch(
      `${API_BASE_URL}/api/v1/groups/student`,
      {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${auth.token}`,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();

      console.error('Error API MyCourses:', {
        status: response.status,
        body: errorText,
      });

      throw new Error(
        `Error al obtener los cursos: ${response.status}`
      );
    }

    const data: MyCourse[] = await response.json();

    return data;
  }
}

export default new MyCoursesService();