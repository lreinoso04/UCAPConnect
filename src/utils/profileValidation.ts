import type { EstudianteProfile } from '../types/api';

/** Solo dígitos; RD 809/829/849 + 7 dígitos (10 en total). */
export function normalizePhoneRd(raw: string): string {
  return raw.replace(/\D/g, '').slice(0, 10);
}

export type ProfileFieldErrors = Partial<Record<keyof EstudianteProfile, string>>;

const RE_NAME = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$/;
const RE_EMAIL = /^[\w.-]+@[\w.-]+\.[a-zA-Z]{2,}$/;
const RE_PHONE = /^(809|829|849)\d{7}$/;
const RE_DATE = /^(\d{2})-(\d{2})-(\d{4})$/;

/**
 * Validación alineada con `EstudianteService.ValidacionesActualizarPerfil` (backend).
 */
export function validateEstudianteProfile(p: EstudianteProfile): ProfileFieldErrors {
  const e: ProfileFieldErrors = {};

  const nombre = (p.nombre ?? '').trim();
  if (!nombre) e.nombre = 'El nombre es obligatorio';
  else if (!RE_NAME.test(nombre)) e.nombre = 'Solo letras y espacios';

  const apellidos = (p.apellidos ?? '').trim();
  if (!apellidos) e.apellidos = 'Los apellidos son obligatorios';
  else if (!RE_NAME.test(apellidos)) e.apellidos = 'Solo letras y espacios';

  const correo = (p.correo ?? '').trim();
  if (!correo) e.correo = 'El correo es obligatorio';
  else if (!RE_EMAIL.test(correo)) e.correo = 'Formato de correo no válido';

  const tel = normalizePhoneRd(p.telefono ?? '');
  if (!tel) e.telefono = 'El teléfono es obligatorio';
  else if (!RE_PHONE.test(tel)) e.telefono = 'Use 10 dígitos: 809, 829 o 849 + número (ej. 8092237051)';

  const fn = (p.fechaNacimiento ?? '').trim();
  if (!fn) e.fechaNacimiento = 'La fecha es obligatoria';
  else {
    const m = fn.match(RE_DATE);
    if (!m) e.fechaNacimiento = 'Formato dd-MM-yyyy';
    else {
      const d = parseInt(m[1], 10);
      const mo = parseInt(m[2], 10);
      const y = parseInt(m[3], 10);
      const dt = new Date(y, mo - 1, d);
      if (dt.getFullYear() !== y || dt.getMonth() !== mo - 1 || dt.getDate() !== d) {
        e.fechaNacimiento = 'Fecha no válida';
      } else if (dt > new Date()) {
        e.fechaNacimiento = 'La fecha no puede ser futura';
      }
    }
  }

  const dir = p.direccion?.trim() ?? '';
  if (dir.length > 255) e.direccion = 'Máximo 255 caracteres';

  return e;
}

export function hasProfileErrors(errs: ProfileFieldErrors): boolean {
  return Object.keys(errs).length > 0;
}

/** Registro: mismos datos de estudiante + usuario y contraseña (`CustomUserDetailsService.Validaciones`). */
export type RegisterFormErrors = ProfileFieldErrors & {
  username?: string;
  password?: string;
};

export function validateRegisterForm(
  profile: EstudianteProfile,
  username: string,
  password: string
): RegisterFormErrors {
  const e: RegisterFormErrors = { ...validateEstudianteProfile(profile) };

  const u = (username ?? '').trim();
  if (!u) e.username = 'El nombre de usuario es obligatorio';

  if (!password?.trim()) e.password = 'La contraseña es obligatoria';
  else if (password.length < 6) e.password = 'Mínimo 6 caracteres';

  return e;
}

export function hasRegisterErrors(errs: RegisterFormErrors): boolean {
  return Object.keys(errs).length > 0;
}
