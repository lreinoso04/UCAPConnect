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

export function uploadProfilePicture(token: string, localUri: string) {
  const parts = localUri.split('/');
  const name = parts[parts.length - 1] ?? 'profile.jpg';
  const extensionMatch = name.match(/\.([^.]+)$/);
  const type = extensionMatch ? `image/${extensionMatch[1].toLowerCase()}` : 'image/jpeg';

  const formData = new FormData();
  formData.append('file', {
    uri: localUri,
    name,
    type,
  } as any);

  return apiRequest<{ fileName: string; success: boolean; message: string }>(
    '/api/v1/student/profile-picture',
    {
      method: 'PUT',
      body: formData,
      token,
    }
  );
}
