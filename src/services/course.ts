import { ApiCourse, Course, mapApiCourseToCourse } from '../types/product';
import { API_BASE_URL } from '../config';



export async function getCourses(
  page: number = 1,
  perPage: number = 10,
  search?: string
): Promise<Course[]> {

  const params = new URLSearchParams();

  params.append('page', page.toString());
  params.append('perPage', perPage.toString());

  if (search?.trim()) {
    params.append('search', search.trim());
  }

  const response = await fetch(
    `${API_BASE_URL}/api/v1/courses?${params.toString()}`
  );

  if (!response.ok) {
    throw new Error('Error al obtener cursos');
  }

  const data: ApiCourse[] = await response.json();

  return data.map(mapApiCourseToCourse);
}

export async function getCourseById(id: string): Promise<Course> {
const response = await fetch(`${API_BASE_URL}/api/v1/courses/${id}`);

  if (!response.ok) {
    throw new Error('Curso no encontrado');
  }

  const data: ApiCourse = await response.json();

  return mapApiCourseToCourse(data);
}