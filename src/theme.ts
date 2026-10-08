import { getActiveTheme } from './i18n/preferences';

/**
 * Paleta UAPA + valores alineados a capturas en /Diseño (Catálogo, Login, Dashboard, Detalle).
 */
const lightColors = {
  /** Azul institucional (paleta) */
  primary: '#041147',
  /** Azul hero / cabeceras como en mockups (#001A4D) */
  heroNavy: '#041147',
  primaryMuted: '#0d1f5c',
  /** Botón filtros / acentos azules en UI */
  interactiveBlue: '#2F80ED',
  surface: '#F2F3F7',
  surfaceMuted: '#EEF1F8',
  surfaceElevated: '#ffffff',
  card: '#ffffff',
  text: '#1a1a1a',
  textMuted: '#6b7280',
  textOnDark: '#ffffff',
  onSurface: '#1a1a1a',
  border: '#e5e7eb',
  accent: '#FF8300',
  accentYellow: '#FFB800',
  /** Valores en grillas (detalle curso) */
  valueBlue: '#2F80ED',
  chipBlueBg: '#E3F2FD',
  chipOrangeBg: '#D97845',
  inputFill: '#F3F4F8',
  error: '#c62828',
  success: '#2e7d32',
  onPrimary: '#ffffff',
  link: '#2F80ED',
  overlay: 'rgba(0, 0, 0, 0.45)',
};

const darkColors: typeof lightColors = {
  ...lightColors,
  surface: '#0B1220',
  surfaceMuted: '#152238',
  surfaceElevated: '#172235',
  card: '#172235',
  text: '#F1F5F9',
  textMuted: '#B4C3D8',
  onSurface: '#F1F5F9',
  border: '#41536D',
  interactiveBlue: '#93C5FD',
  valueBlue: '#93C5FD',
  chipBlueBg: '#213B5B',
  inputFill: '#243247',
  error: '#FCA5A5',
  success: '#86EFAC',
  link: '#93C5FD',
};

export type AppColors = typeof lightColors;

// Render-time uses (icons, navigation, placeholders) follow the current preference.
// Static StyleSheet values are adapted by the themed native primitives.
export const colors = new Proxy(lightColors, {
  get(target, property) {
    const palette = getActiveTheme() === 'dark' ? darkColors : target;
    return palette[property as keyof AppColors];
  },
}) as AppColors;

const surfaceMap: Record<string, string> = {
  '#ffffff': '#172235',
  '#fff': '#172235',
  '#fafafa': '#172235',
  '#f8fafc': '#0b1220',
  '#f8f9fc': '#0b1220',
  '#f5f6fa': '#0b1220',
  '#f2f3f7': '#0b1220',
  '#eef1f8': '#152238',
  '#eef2f7': '#152238',
  '#f3f4f8': '#243247',
  '#f3f4f6': '#243247',
  '#f0f2f8': '#243247',
  '#f0f0f0': '#243247',
  '#e3f2fd': '#213b5b',
  '#e8f0fe': '#213b5b',
  '#fff8e1': '#3b301f',
  '#fff7ed': '#3b2c25',
  '#fff3e0': '#3b2c25',
  '#ffedd5': '#3b2c25',
  '#e8f5e9': '#19372f',
  '#fce4ec': '#3b2637',
  '#fce8e8': '#3b242b',
  '#fef2f2': '#3b242b',
  '#fee2e2': '#542d37',
  '#ffebee': '#3b242b',
  '#ffeaeb': '#3b242b',
};

const textMap: Record<string, string> = {
  '#000': '#f1f5f9',
  '#000000': '#f1f5f9',
  '#1a1a1a': '#f1f5f9',
  '#1f2937': '#f1f5f9',
  '#333': '#f1f5f9',
  '#404040': '#f1f5f9',
  '#4b5563': '#cbd5e1',
  '#475569': '#cbd5e1',
  '#52697b': '#cbd5e1',
  '#5d4037': '#e9c9ad',
  '#666': '#b4c3d8',
  '#6b7280': '#b4c3d8',
  '#999': '#b4c3d8',
  '#9ca3af': '#b4c3d8',
  '#001b5e': '#93c5fd',
  '#041147': '#93c5fd',
  '#0056d2': '#93c5fd',
  '#007bff': '#93c5fd',
  '#2f80ed': '#93c5fd',
  '#d32f2f': '#fca5a5',
  '#c62828': '#fca5a5',
  '#dc2626': '#fca5a5',
  '#2e7d32': '#86efac',
  '#1b5e20': '#86efac',
  '#16a34a': '#86efac',
  '#e65100': '#fdba74',
};

const borderMap: Record<string, string> = {
  '#e5e7eb': '#41536d',
  '#e5e5e5': '#41536d',
  '#cfd8e8': '#41536d',
  '#eef1f8': '#41536d',
  '#f2f3f7': '#41536d',
  '#ffffff': '#41536d',
};

export function darkColor(value: string | undefined, property: string): string | undefined {
  if (!value || getActiveTheme() !== 'dark') return value;
  const key = value.toLowerCase();
  if (property === 'backgroundColor') {
    const whiteAlpha = key.match(/^rgba\(255,\s*255,\s*255,\s*(0?\.\d+|1)\)$/);
    if (whiteAlpha && Number(whiteAlpha[1]) >= 0.45) return `rgba(23,34,53,${whiteAlpha[1]})`;
    return surfaceMap[key] ?? value;
  }
  if (property === 'color' || property === 'tintColor' || property === 'placeholderTextColor') {
    return textMap[key] ?? value;
  }
  if (property.toLowerCase().includes('border') && property.endsWith('Color')) {
    return borderMap[key] ?? value;
  }
  return value;
}

/** Márgenes laterales habituales en los mockups (~20px) */
export const layout = {
  screenPadding: 20,
};

export const typography = {
  fontFamily: {
    regular: undefined as string | undefined,
    medium: undefined as string | undefined,
    semibold: undefined as string | undefined,
    bold: undefined as string | undefined,
  },
  size: {
    xs: 11,
    sm: 13,
    md: 15,
    body: 16,
    lg: 18,
    xl: 22,
    xxl: 26,
    hero: 28,
  },
  lineHeight: {
    tight: 20,
    body: 22,
    relaxed: 24,
  },
  weight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
  h1: {
    fontSize: 28,
    fontWeight: '700' as const,
    lineHeight: 32,
  },
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 22,
  },
  label: {
    fontSize: 13,
    fontWeight: '600' as const,
    lineHeight: 18,
  },
  button: {
    fontSize: 16,
    fontWeight: '600' as const,
    lineHeight: 20,
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const radius = {
  xs: 6,
  sm: 10,
  md: 14,
  lg: 18,
  xl: 22,
  pill: 999,
};
