import { API_BASE_URL } from '../config';
import { ApiException } from './client';
import type { CursoResponse } from '../types/api';

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
