/**
 * Normaliza fechas de ACF / API para mostrar en detalle de curso.
 * Soporta: yyyyMMdd, dd-MM-yyyy, ISO, y objetos { date | rendered | value }.
 */
export function formatFechaInicio(raw: unknown): string | null {
  if (raw == null) return null;

  if (typeof raw === 'number' && Number.isFinite(raw)) {
    return formatFechaInicio(String(Math.trunc(raw)));
  }

  if (typeof raw === 'object') {
    const o = raw as Record<string, unknown>;
    const nested = o.date ?? o.rendered ?? o.value ?? o.formatted;
    if (nested != null && nested !== raw) {
      return formatFechaInicio(nested);
    }
    return null;
  }

  const s = String(raw).trim();
  if (!s) return null;

  // yyyyMMdd (8 dígitos)
  if (/^\d{8}$/.test(s)) {
    const y = s.slice(0, 4);
    const m = s.slice(4, 6);
    const d = s.slice(6, 8);
    return formatParts(d, m, y);
  }

  // dd-MM-yyyy o dd/MM/yyyy
  let m = s.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);
  if (m) {
    const dd = m[1].padStart(2, '0');
    const mm = m[2].padStart(2, '0');
    return formatParts(dd, mm, m[3]);
  }

  // yyyy-MM-dd (ISO)
  m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (m) {
    return formatParts(m[3], m[2], m[1]);
  }

  // Timestamp numérico (segundos o ms)
  if (/^\d{10,13}$/.test(s)) {
    const n = Number(s);
    const ms = s.length <= 10 ? n * 1000 : n;
    const date = new Date(ms);
    if (!Number.isNaN(date.getTime())) {
      return formatParts(
        String(date.getDate()).padStart(2, '0'),
        String(date.getMonth() + 1).padStart(2, '0'),
        String(date.getFullYear())
      );
    }
  }

  return s;
}

const MONTHS_ES = [
  'enero',
  'febrero',
  'marzo',
  'abril',
  'mayo',
  'junio',
  'julio',
  'agosto',
  'septiembre',
  'octubre',
  'noviembre',
  'diciembre',
];

function formatParts(day: string, month: string, year: string): string {
  const mi = Number(month) - 1;
  if (mi >= 0 && mi < 12) {
    const dayNum = Number(day);
    const name = MONTHS_ES[mi];
    return `${dayNum} de ${name} de ${year}`;
  }
  return `${day}/${month}/${year}`;
}
