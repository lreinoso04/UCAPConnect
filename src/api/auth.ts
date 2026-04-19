import { apiRequest, loginRequest } from './client';
import type { LoginResponse, RegisterPayload, ChangePasswordRequestDTO } from '../types/api';

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

export function changePassword(payload: ChangePasswordRequestDTO, token: string) {
  return apiRequest<Record<string, string>>('/api/v1/auth/change-password', {
    method: 'PUT',
    body: payload,
    token,
  });
}

export function forgotPassword(email: string) {
  return apiRequest<{ message: string }>('/api/v1/auth/forgot-password', {
    method: 'POST',
    body: { email },
  });
}
