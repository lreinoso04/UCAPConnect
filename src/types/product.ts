export interface Course {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category: string;
  rating: number;
  reviews_count: number;
  instructor: string;
  duration: string;
  level: string;
  students_count: number;
  badge_color: string;
  created_at: string;
}

export interface CartItem {
  course: Course;
}
