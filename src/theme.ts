/**
 * Paleta UAPA + valores alineados a capturas en /Diseño (Catálogo, Login, Dashboard, Detalle).
 */
export const colors = {
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
