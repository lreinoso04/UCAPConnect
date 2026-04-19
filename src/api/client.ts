import { API_BASE_URL } from '../config';

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

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
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
