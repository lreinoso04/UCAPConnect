import * as SecureStore from 'expo-secure-store';

const KEY = 'ucapconnect_auth';

export interface StoredAuth {
  token: string;
  username: string;
  rol: string;
  img: string | null;
}

export async function saveAuth(data: StoredAuth): Promise<void> {
  await SecureStore.setItemAsync(KEY, JSON.stringify(data));
}

export async function loadAuth(): Promise<StoredAuth | null> {
  const raw = await SecureStore.getItemAsync(KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StoredAuth;
  } catch {
    return null;
  }
}

/** Cierra sesión (borra token guardado). */
export async function clearStoredSession(): Promise<void> {
  await SecureStore.deleteItemAsync(KEY);
}

/** @deprecated Usar clearStoredSession */
export async function clearAuth(): Promise<void> {
  await clearStoredSession();
}
