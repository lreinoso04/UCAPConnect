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
};

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<StoredAuth | null>(null);
  const [isGuest, setIsGuest] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const stored = await loadAuth();
      const guest = await loadGuestSession();
      if (!cancelled) {
        if (stored) {
          setUser(stored);
          setIsGuest(false);
        } else if (guest) {
          setUser(null);
          setIsGuest(true);
        } else {
          setUser(null);
          setIsGuest(false);
        }
        setReady(true);
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
    await setGuestSession(false);
    setIsGuest(false);
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
    }),
    [user, isGuest, ready, login, register, logout, enterAsGuest, exitGuestToLogin]
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
