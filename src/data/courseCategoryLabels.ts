/**
 * La API puede devolver `categoria_del_curso` como ID de taxonomía, color ACF (#hex)
 * u otro valor. Aquí se resuelve una etiqueta legible para badges y detalle.
 *
 * Ajusta `CATEGORY_ID_TO_LABEL` con los IDs reales de tu WordPress (ver términos en WP Admin).
 */
import type { CursoResponse } from '../types/api';

/** IDs numéricos (como string) → etiqueta visible (ej. mockup: Diplomado, Curso MOOC, Curso Taller) */
export const CATEGORY_ID_TO_LABEL: Record<string, string> = {
  // Ejemplos — reemplaza por los IDs de tu sitio:
  // '12': 'Diplomado',
  // '34': 'Curso MOOC',
  // '56': 'Curso Taller',
};

/**
 * Colores hex devueltos por un campo tipo “color” en ACF (no son el nombre del tipo).
 * Añade aquí hex → etiqueta si no puedes usar `tipo_de_curso` como respaldo.
 */
export const CATEGORY_HEX_TO_LABEL: Record<string, string> = {
  // c1839f: 'Diplomado',
};

function normalizeHex(raw: string): string | null {
  const t = raw.trim().replace(/^#/, '').toLowerCase();
  if (/^[0-9a-f]{6}$/.test(t)) return t;
  return null;
}

function strVal(v: unknown): string {
  if (v == null) return '';
  if (typeof v === 'object') return '';
  return String(v).trim();
}

/**
 * Etiqueta para badge / categoría en cabecera de detalle.
 */
export function resolveCourseCategoryLabel(acf: CursoResponse['acf'] | undefined): string {
  if (!acf || typeof acf !== 'object') return 'Capacitación';

  const tipo = strVal(acf.tipo_de_curso);
  const catRaw = acf.categoria_del_curso;
  const cat = strVal(catRaw);

  if (cat) {
    const hex = normalizeHex(cat);
    if (hex) {
      if (CATEGORY_HEX_TO_LABEL[hex]) return CATEGORY_HEX_TO_LABEL[hex];
      if (tipo) return tipo;
      return 'Capacitación';
    }

    if (/^\d+$/.test(cat)) {
      if (CATEGORY_ID_TO_LABEL[cat]) return CATEGORY_ID_TO_LABEL[cat];
      if (tipo) return tipo;
      return 'Curso';
    }

    return cat;
  }

  if (tipo) return tipo;
  return 'Capacitación';
}
