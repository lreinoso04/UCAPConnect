import { ApiCourse, Course, mapApiCourseToCourse } from '../types/product';
import { API_BASE_URL } from '../config';



export async function getCourses(): Promise<Course[]> {
const response = await fetch(`${API_BASE_URL}/api/v1/courses`);

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