import { normalizePhoneRd } from './profileValidation';

/** Muestra teléfono RD como 809-123-4567 (valor almacenado: solo dígitos). */
export function formatPhoneRdDisplay(digits: string): string {
  const d = normalizePhoneRd(digits);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `${d.slice(0, 3)}-${d.slice(3)}`;
  return `${d.slice(0, 3)}-${d.slice(3, 6)}-${d.slice(6)}`;
}

/** Cédula dominicana: 11 dígitos → 000-0000000-0 */
export function normalizeCedulaDigits(raw: string): string {
  return raw.replace(/\D/g, '').slice(0, 11);
}

export function formatCedulaRdDisplay(digits: string): string {
  const d = normalizeCedulaDigits(digits);
  if (d.length <= 3) return d;
  if (d.length <= 10) return `${d.slice(0, 3)}-${d.slice(3)}`;
  return `${d.slice(0, 3)}-${d.slice(3, 10)}-${d.slice(10)}`;
}

/**
 * Pasaporte u otro ID con letras: sin guiones automáticos.
 * Solo dígitos (cédula): guiones según formato RD.
 */
export function normalizeDocumentoIdentidad(raw: string): string {
  const t = raw.trim();
  if (/[a-zA-Z]/.test(t)) {
    return t.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 24);
  }
  return normalizeCedulaDigits(raw);
}

export function formatDocumentoIdentidadDisplay(stored: string): string {
  if (!stored) return '';
  if (/[a-zA-Z]/.test(stored)) return stored;
  return formatCedulaRdDisplay(stored);
}

const RE_DD_MM_YYYY = /^(\d{2})-(\d{2})-(\d{4})$/;

export function parseDdMmYyyy(s: string): Date | null {
  const t = s.trim();
  const m = t.match(RE_DD_MM_YYYY);
  if (!m) return null;
  const d = parseInt(m[1], 10);
  const mo = parseInt(m[2], 10);
  const y = parseInt(m[3], 10);
  const dt = new Date(y, mo - 1, d);
  if (dt.getFullYear() !== y || dt.getMonth() !== mo - 1 || dt.getDate() !== d) return null;
  return dt;
}

export function formatDdMmYyyy(d: Date): string {
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
}
