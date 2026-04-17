import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { login as apiLogin, logout as apiLogout, registerStudent } from '../api/auth';
import { clearStoredSession, loadAuth, saveAuth, type StoredAuth } from '../storage/authStorage';
import { loadGuestSession, setGuestSession } from '../storage/guestStorage';
import type { RegisterPayload } from '../types/api';
import { ApiException } from '../api/client';

type AuthState = {
  user: StoredAuth | null;
  /** Navegación sin cuenta: catálogo público y pestañas con restricción */
  isGuest: boolean;
  ready: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<Record<string, string>>;
  logout: () => Promise<void>;
  enterAsGuest: () => Promise<void>;
  exitGuestToLogin: () => Promise<void>;
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
  const [isGuest, setIsGuest] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const stored = await withTimeout(loadAuth());
        const guest = await withTimeout(loadGuestSession());
        
        if (!cancelled) {
          if (stored) {
            setUser(stored);
            setIsGuest(false);
          } else {
            setUser(null);
            setIsGuest(!!guest);
          }
          setReady(true);
        }
      } catch (error) {
        if (!cancelled) {
          setUser(null);
          setIsGuest(false);
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
    await setGuestSession(false);
    setIsGuest(false);
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
    await setGuestSession(true);
    setIsGuest(true);
    setUser(null);
  }, [user?.token]);

  const enterAsGuest = useCallback(async () => {
    await clearStoredSession();
    await setGuestSession(true);
    setUser(null);
    setIsGuest(true);
  }, []);

  const exitGuestToLogin = useCallback(async () => {
    await setGuestSession(false);
    setIsGuest(false);
  }, []);

  const restoreSession = useCallback(async (data: StoredAuth) => {
    await saveAuth(data);
    await setGuestSession(false);
    setIsGuest(false);
    setUser(data);
  }, []);

  const updateUserImage = useCallback(async (uri: string) => {
    if (user) {
      const nextUser = { ...user, img: uri };
      await saveAuth(nextUser);
      setUser(nextUser);
    }
  }, [user]);

  const value = useMemo(
    () => ({
      user,
      isGuest,
      ready,
      login,
      register,
      logout,
      enterAsGuest,
      exitGuestToLogin,
      restoreSession,
      updateUserImage,
    }),
    [user, isGuest, ready, login, register, logout, enterAsGuest, exitGuestToLogin, restoreSession, updateUserImage]
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
