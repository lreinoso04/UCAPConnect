import { apiRequest, loginRequest } from './client';
import type { LoginResponse, RegisterPayload } from '../types/api';

export function login(username: string, password: string) {
  return loginRequest(username, password);
}

export function registerStudent(payload: RegisterPayload) {
  return apiRequest<Record<string, string>>('/api/v1/auth/register', {
    method: 'POST',
    body: payload,
  });
}

export function logout(token: string) {
  return apiRequest<{ message?: string }>('/api/v1/auth/logout', {
    method: 'POST',
    token,
  });
}

export type { LoginResponse };
