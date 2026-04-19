import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { login as apiLogin, logout as apiLogout, registerStudent } from '../api/auth';
import { uploadProfilePicture } from '../api/student';
import { clearStoredSession, loadAuth, saveAuth, type StoredAuth } from '../storage/authStorage';
import { loadGuestSession, setGuestSession } from '../storage/guestStorage';
import type { RegisterPayload } from '../types/api';
import { ApiException } from '../api/client';

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

// Helper para evitar que las Promesas de SecureStore o AsyncStorage se cuelguen infinitamente en Android
const withTimeout = <T,>(promise: Promise<T>, ms: number = 3000): Promise<T | null> => {
  return Promise.race([
    promise,
    new Promise<null>((resolve) => setTimeout(() => resolve(null), ms)),
  ]);
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<StoredAuth | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const stored = await withTimeout(loadAuth());
        
        if (!cancelled) {
          if (stored) {
            setUser(stored);
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
    };
    await saveAuth(next);
    setUser(next);
  }, []);

  const register = useCallback(async (payload: RegisterPayload) => {
    return registerStudent(payload);
  }, []);

  const logout = useCallback(async () => {
    if (user?.token) {
      try {
        await apiLogout(user.token);
      } catch {
        /* ignorar */
      }
    }
    await clearStoredSession();
    setUser(null);
  }, [user?.token]);

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
