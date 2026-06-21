// Archivo: src/api/client.ts
import { API_BASE_URL } from '../config';
import { loadAuth } from '../storage/authStorage';
import { authEvents } from './authEvents';
import type { CursoResponse } from '../types/api';

export class ApiException extends Error {
  constructor(
    message: string,
    public status: number,
    public body?: unknown
  ) {
    super(message);
    this.name = 'ApiException';
  }
}

type RequestOptions = Omit<RequestInit, 'body'> & {
  body?: unknown;
  token?: string | null;
};

// Función auxiliar para validar localmente antes de cualquier petición (Caso 3)
async function checkLocalExpiration(): Promise<boolean> {
  const auth = await loadAuth();
  if (auth && auth.expireAt) {
    const expired = new Date(auth.expireAt).getTime() <= Date.now();
    if (expired) {
      authEvents.emitLogout(); // 🚨 ¡Botón de pánico! Sacar al usuario
      return true;
    }
  }
  return false;
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  // 🔥 Caso 3: Validar expiración local antes de lanzar el request
  const isExpired = await checkLocalExpiration();
  if (isExpired) {
    throw new ApiException('Token expirado localmente antes de enviar.', 401);
  }

  const { body, token, headers: extraHeaders, ...rest } = options;
  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...(extraHeaders as Record<string, string>),
  };

  if (body !== undefined && !(body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...rest,
    headers,
    body: body instanceof FormData ? body : body !== undefined ? JSON.stringify(body) : undefined,
  });

  // 🔥 Caso 2: El backend retornó 401 Unauthorized de forma global
  if (res.status === 401) {
    authEvents.emitLogout();
  }

  const text = await res.text();
  let parsed: unknown = undefined;
  if (text) {
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = text;
    }
  }

  if (!res.ok) {
    const o = typeof parsed === 'object' && parsed !== null ? (parsed as Record<string, unknown>) : null;
    const msg =
      (o && typeof o.message === 'string' && o.message) ||
      (o && typeof o.error === 'string' && o.error) ||
      `Error ${res.status}`;
    throw new ApiException(msg, res.status, parsed);
  }

  return parsed as T;
}

export async function loginRequest(username: string, password: string): Promise<import('../types/api').LoginResponse> {
  const res = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password }),
  });

  const text = await res.text();
  let parsed: unknown;
  try {
    parsed = text ? JSON.parse(text) : {};
  } catch {
    throw new ApiException('Respuesta inválida del servidor', res.status);
  }

  if (!res.ok) {
    const o = typeof parsed === 'object' && parsed !== null ? (parsed as Record<string, unknown>) : null;
    const msg =
      (o && typeof o.message === 'string' && o.message) ||
      (o && typeof o.error === 'string' && o.error) ||
      'Credenciales incorrectas';
    throw new ApiException(msg, res.status, parsed);
  }

  const headerToken = res.headers.get('Authorization')?.replace(/^Bearer\s+/i, '');
  const data = parsed as import('../types/api').LoginResponse;
  if (headerToken && !data.token) {
    data.token = headerToken;
  }
  return data;
}

export type FetchCoursesResult = {
  courses: CursoResponse[];
  total: number | null;
};

export async function fetchCourses(params: {
  page?: number;
  per_page?: number;
  search?: string;
  token?: string | null;
}): Promise<FetchCoursesResult> {
  // 🔥 Caso 3: Validar expiración local antes de buscar cursos
  const isExpired = await checkLocalExpiration();
  if (isExpired) {
    throw new ApiException('Token expirado localmente.', 401);
  }
  
  const q = new URLSearchParams();
  q.set('page', String(params.page ?? 1));
  q.set('per_page', String(params.per_page ?? 20));
  if (params.search?.trim()) {
    q.set('search', params.search.trim());
  }

  const url = `${API_BASE_URL}/api/v1/courses?${q.toString()}`;
  const headers: Record<string, string> = {
    Accept: 'application/json',
  };
  if (params.token) {
    headers.Authorization = `Bearer ${params.token}`;
  }

  try {
    const res = await fetch(url, { method: 'GET', headers });

    // 🔥 Caso 2: Control global de error 401 en el catálogo
    if (res.status === 401) {
      authEvents.emitLogout();
    }

    const text = await res.text();
    let parsed: unknown;
    if (text) {
      try {
        parsed = JSON.parse(text);
      } catch {
        parsed = text;
      }
    } else {
      parsed = [];
    }

    if (!res.ok) {
      const o = typeof parsed === 'object' && parsed !== null ? (parsed as Record<string, unknown>) : null;
      const msg =
        (o && typeof o.message === 'string' && o.message) ||
        (o && typeof o.error === 'string' && o.error) ||
        `Error ${res.status}`;
      throw new ApiException(msg, res.status, parsed);
    }

    const totalHeader = res.headers.get('X-Total-Count') ?? res.headers.get('x-total-count');
    let total: number | null = null;
    if (totalHeader != null) {
      const n = parseInt(totalHeader, 10);
      if (Number.isFinite(n)) total = n;
    }

    const courses = parsed as CursoResponse[];
    return { courses, total };
  } catch (error) {
    throw error;
  }
}