export interface Course {
  id: string;
  name: string;
  description: string;
  image_url: string;

  category?: string;
  price: number;
  rating: number;
  reviews_count?: number;
  instructor: string;
  duration?: string;
  level?: string;
  students_count?: number;
  badge_color?: string;
  created_at?: string;
}

export interface CartItem {
  course: Course;
}

export interface ApiCourse {
  id: number;
  link: string;
  title: string;
  imagen: string;
  acf: {
    fecha_inicio: string | null;
    dirigido_a: string;
    categoria_del_curso: string;
    hora: string;
    inversion: string;
    nombre_coordinador: string;
    objetivo: string;
    tipo_de_curso: string;
    otros_detalles: string;
    modalidad: string;
    duracion_horas: string;
  };
}


export function mapApiCourseToCourse(apiCourse: ApiCourse): Course {


  return {
    id: apiCourse.id.toString(),
    name: apiCourse.title,
    description: apiCourse.acf.objetivo,
    price: parseFloat(
      (apiCourse.acf?.inversion ?? '0')
        .replace(/[^\d.]/g, '')
    ),
    image_url: apiCourse.imagen,
    category: apiCourse.acf.tipo_de_curso,
    rating: 0,
    reviews_count: 0,
    instructor: apiCourse.acf.nombre_coordinador,
    duration: apiCourse.acf.duracion_horas || 'No especificado',
    level: 'General',
    students_count: 0,
    badge_color: apiCourse.acf.categoria_del_curso || '#3B82F6',
    created_at: apiCourse.acf.fecha_inicio || new Date().toISOString(),
  };
}