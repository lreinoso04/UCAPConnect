export interface LoginResponse {
  username: string;
  token: string;
  rol: string;
  img: string | null;
  expireIn: number;
}

export interface RegisterPayload {
  nombre: string;
  apellidos: string;
  correo: string;
  telefono: string;
  direccion: string;
  fechaNacimiento: string;
  username: string;
  password: string;
}

export interface EstudianteProfile {
  nombre: string;
  apellidos: string;
  correo: string;
  telefono: string;
  fechaNacimiento: string;
  direccion: string;
}

export interface CursoResponse {
  id: number;
  link: string;
  title: string;
  acf: Record<string, unknown>;
  imagen: string;
}

export interface ApiErrorBody {
  message?: string;
  error?: string;
}
