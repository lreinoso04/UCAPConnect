import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Appearance } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { translateKnown } from './translations';

export type Language = 'es' | 'en';
export type ThemeMode = 'light' | 'dark';

const LANGUAGE_KEY = 'ucapconnect.language';
const THEME_KEY = 'ucapconnect.theme';

let activeLanguage: Language = 'es';
let activeTheme: ThemeMode = 'light';

export function getActiveLanguage() { return activeLanguage; }
export function getActiveTheme() { return activeTheme; }
export function translate(value: string) { return translateKnown(value, activeLanguage); }

interface PreferencesValue {
  language: Language;
  theme: ThemeMode;
  dark: boolean;
  setLanguage: (language: Language) => void;
  setTheme: (theme: ThemeMode) => void;
  t: (value: string) => string;
}

const PreferencesContext = createContext<PreferencesValue | null>(null);

export function PreferencesProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('es');
  const [theme, setThemeState] = useState<ThemeMode>('light');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    Promise.all([AsyncStorage.getItem(LANGUAGE_KEY), AsyncStorage.getItem(THEME_KEY)])
      .then(([savedLanguage, savedTheme]) => {
        if (!mounted) return;
        const nextLanguage: Language = savedLanguage === 'en' ? 'en' : 'es';
        const nextTheme: ThemeMode = savedTheme === 'dark' || savedTheme === 'light'
          ? savedTheme
          : Appearance.getColorScheme() === 'dark' ? 'dark' : 'light';
        activeLanguage = nextLanguage;
        activeTheme = nextTheme;
        setLanguageState(nextLanguage);
        setThemeState(nextTheme);
      })
      .catch(() => {
        // Keep the Spanish/light defaults when local storage is unavailable.
      })
      .finally(() => { if (mounted) setReady(true); });
    return () => { mounted = false; };
  }, []);

  const setLanguage = useCallback((next: Language) => {
    activeLanguage = next;
    setLanguageState(next);
    void AsyncStorage.setItem(LANGUAGE_KEY, next).catch(() => {});
  }, []);

  const setTheme = useCallback((next: ThemeMode) => {
    activeTheme = next;
    setThemeState(next);
    void AsyncStorage.setItem(THEME_KEY, next).catch(() => {});
  }, []);

  const value = useMemo<PreferencesValue>(() => ({
    language,
    theme,
    dark: theme === 'dark',
    setLanguage,
    setTheme,
    t: (text) => translateKnown(text, language),
  }), [language, theme, setLanguage, setTheme]);

  return <PreferencesContext.Provider value={value}>{ready ? children : null}</PreferencesContext.Provider>;
}

export function usePreferences(): PreferencesValue {
  const value = useContext(PreferencesContext);
  if (!value) throw new Error('usePreferences requires PreferencesProvider');
  return value;
}
