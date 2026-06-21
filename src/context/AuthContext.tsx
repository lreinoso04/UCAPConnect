// Archivo: src/context/AuthContext.tsx
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { login as apiLogin, logout as apiLogout, registerStudent } from '../api/auth';
import { uploadProfilePicture } from '../api/student';
import { clearStoredSession, loadAuth, saveAuth, type StoredAuth } from '../storage/authStorage';
import type { RegisterPayload } from '../types/api';
import { ApiException } from '../api/client';
import { authEvents } from '../api/authEvents'; // 👈 1. IMPORTAMOS EL MENSAJERO GLOBAL

type AuthState = {
  user: StoredAuth | null;
  ready: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<Record<string, string>>;
  logout: () => Promise<void>;
  restoreSession: (data: StoredAuth) => Promise<void>;
  updateUserImage: (localUri: string) => Promise<void>;
};

const AuthContext = createContext<AuthState | undefined>(undefined);

const withTimeout = <T,>(promise: Promise<T>, ms: number = 3000): Promise<T | null> => {
  return Promise.race([
    promise,
    new Promise<null>((resolve) => setTimeout(() => resolve(null), ms)),
  ]);
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<StoredAuth | null>(null);
  const [ready, setReady] = useState(false);

  // 🔥 2. AGREGADO: Escucha global para el Caso 2 y Caso 3 (Botón de pánico)
  useEffect(() => {
    const unsubscribe = authEvents.subscribe(async () => {
      await clearStoredSession(); // Borra el token viejo del teléfono
      setUser(null);              // Saca al usuario al Login inmediatamente
    });
    return () => unsubscribe();   // Limpia la escucha si el componente se desmonta
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const stored = await withTimeout(loadAuth());

        if (!cancelled) {
          if (stored) {
            const expired =
              new Date(stored.expireAt).getTime() <= Date.now();

            if (expired) {
              await clearStoredSession();
              setUser(null);
            } else {
              setUser(stored);
            }
          } else {
            setUser(null);
          }
          setReady(true);
        }
      } catch (error) {
        if (!cancelled) {
          setUser(null);
          setReady(true);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

   const logout = useCallback(async () => {
    if (user?.token) {
      try {
        await apiLogout(user.token);
      } catch {}
    }
    await clearStoredSession();
    setUser(null);
  }, [user?.token]);

  useEffect(() => {
    if (!user?.expireAt) return;

    const expiresIn =
      new Date(user.expireAt).getTime() - Date.now();

    if (expiresIn <= 0) {
      logout();
      return;
    }

    const timer = setTimeout(() => {
      logout();
    }, expiresIn);

    return () => clearTimeout(timer);
  }, [user, logout]);

  const login = useCallback(async (username: string, password: string) => {
    const res = await apiLogin(username, password);
    if (!res.token) {
      throw new Error('El servidor no devolvió token');
    }
    const next: StoredAuth = {
      token: res.token,
      username: res.username,
      rol: res.rol,
      img: res.img ?? null,
      expireAt: res.expireIn,
    };
    await saveAuth(next);
    setUser(next);
  }, []);

  const register = useCallback(async (payload: RegisterPayload) => {
    return registerStudent(payload);
  }, []);

  const restoreSession = useCallback(async (data: StoredAuth) => {
    await saveAuth(data);
    setUser(data);
  }, []);

  const updateUserImage = useCallback(async (uri: string) => {
    if (!user) return;

    const uploadResult = await uploadProfilePicture(user.token, uri);
    const nextUser = { ...user, img: uploadResult.fileName };
    await saveAuth(nextUser);
    setUser(nextUser);
  }, [user]);

  const value = useMemo(
    () => ({
      user,
      ready,
      login,
      register,
      logout,
      restoreSession,
      updateUserImage,
    }),
    [user, ready, login, register, logout, restoreSession, updateUserImage]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return ctx;
}

export { ApiException };