/**
 * Sanitiza valores para uso seguro em CSS custom properties (--var: value).
 * Previne XSS quando valores vêm de config/API e são injetados em dangerouslySetInnerHTML.
 */

/** Caracteres perigosos que poderiam escapar do contexto CSS e injetar código */
const UNSAFE_CSS_CHARS = /[;{}<>"'`\\\n\r]/g;

const SAFE_CSS_NAMES = /^[a-zA-Z0-9_-]+$/;

export function sanitizeCssColor(value: string | undefined): string {
  if (value == null || typeof value !== 'string') return '';
  return value.replace(UNSAFE_CSS_CHARS, '').trim().slice(0, 128);
}

export function sanitizeCssVarKey(key: string | undefined): string {
  if (key == null || typeof key !== 'string') return '';
  const trimmed = key.trim();
  if (!trimmed) return '';
  if (SAFE_CSS_NAMES.test(trimmed)) return trimmed;
  return '';
}
