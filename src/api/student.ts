import { apiRequest } from './client';
import type { EstudianteProfile } from '../types/api';

export function getProfile(token: string) {
  return apiRequest<EstudianteProfile>('/api/v1/student/profile', {
    method: 'GET',
    token,
  });
}

export function updateProfile(token: string, body: EstudianteProfile) {
  return apiRequest<EstudianteProfile>('/api/v1/student/profile', {
    method: 'PUT',
    body,
    token,
  });
}
