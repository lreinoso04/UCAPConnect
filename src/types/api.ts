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

export interface CursoAcf {
  fecha_inicio?: string;
  fecha_de_inicio?: string;
  duracion_horas?: string;
  modalidad?: string;
  recinto?: string;
  hora?: string;
  nombre_coordinador?: string;
  objetivo?: string;
  dirigido_a?: string;
  inversion?: string;
  contenido_personalizado1?: string;
  [key: string]: unknown;
}

export interface CursoResponse {
  id: number;
  link: string;
  title: string;
  acf: CursoAcf;
  imagen: string;
}

export interface ChangePasswordRequestDTO {
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
}

export interface UserRequestDTO extends RegisterPayload {}

export interface ApiErrorBody {
  message?: string;
  error?: string;
}
