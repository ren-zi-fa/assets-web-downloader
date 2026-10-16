/**
 * Helper warna kanonis sisi-popup.
 *
 * Seperti `shared/url.ts`, file ini adalah versi kanonis yang dipakai UI dan
 * diuji di sini; pemindai di setiap folder fitur (`features/audio`, dst.)
 * SENGAJA menduplikasi logikanya karena fungsi pemindai wajib self-contained
 * (lihat catatan di `features/images/scanner.ts`).
 */

/** Warna solid yang sudah dinormalkan. */
export interface NormalizedColor {
  /** '#RRGGBB' huruf besar. */
  hex: string;
  /** 'rgb(r, g, b)'. */
  rgb: string;
}

function toHex(value: number): string {
  const clamped = Math.max(0, Math.min(255, Math.round(value)));
  return clamped.toString(16).padStart(2, '0');
}

/** '#RRGGBB' (huruf besar) dari komponen 0-255. */
export function rgbToHex(r: number, g: number, b: number): string {
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

/** [r, g, b, a] dari nilai heksadesimal (#rgb/#rgba/#rrggbb/#rrggbbaa). */
function parseHex(value: string): [number, number, number, number] | null {
  const raw = value.slice(1);
  const expand = (part: string): number => parseInt(part.length === 1 ? part + part : part, 16);
  if (raw.length === 3 || raw.length === 4) {
    const r = expand(raw.charAt(0));
    const g = expand(raw.charAt(1));
    const b = expand(raw.charAt(2));
    const a = raw.length === 4 ? expand(raw.charAt(3)) / 255 : 1;
    if ([r, g, b, a].some(Number.isNaN)) return null;
    return [r, g, b, a];
  }
  if (raw.length === 6 || raw.length === 8) {
    const r = parseInt(raw.slice(0, 2), 16);
    const g = parseInt(raw.slice(2, 4), 16);
    const b = parseInt(raw.slice(4, 6), 16);
    const a = raw.length === 8 ? parseInt(raw.slice(6, 8), 16) / 255 : 1;
    if ([r, g, b, a].some(Number.isNaN)) return null;
    return [r, g, b, a];
  }
  return null;
}

/** Satu komponen `rgb()` → 0-255 (mendukung persen). */
function channel(token: string): number {
  return token.endsWith('%') ? (parseFloat(token) / 100) * 255 : parseFloat(token);
}

/** Nilai alpha `rgb()` → 0-1 (mendukung persen). */
function alpha(token: string): number {
  return token.endsWith('%') ? parseFloat(token) / 100 : parseFloat(token);
}

/**
 * Normalkan nilai warna CSS apa pun menjadi hex + rgb, atau `null` bila bukan
 * warna solid yang bisa ditampilkan (transparan, `currentColor`, atau format
 * yang tak dikenal seperti `color(srgb ...)`).
 */
export function normalizeColor(input: string): NormalizedColor | null {
  const value = (input || '').trim().toLowerCase();
  if (!value || value === 'transparent' || value === 'none' || value === 'currentcolor') {
    return null;
  }

  if (value.startsWith('#')) {
    const rgba = parseHex(value);
    if (!rgba || rgba[3] <= 0) return null;
    const [r, g, b] = rgba;
    return {
      hex: rgbToHex(r, g, b),
      rgb: `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`,
    };
  }

  const match = value.match(/^rgba?\(([^)]+)\)$/);
  if (!match) return null;
  const parts = (match[1] ?? '')
    .split(/[,/\s]+/)
    .map((part) => part.trim())
    .filter(Boolean);
  const [rToken, gToken, bToken, aToken] = parts;
  if (!rToken || !gToken || !bToken) return null;
  const r = channel(rToken);
  const g = channel(gToken);
  const b = channel(bToken);
  const a = aToken ? alpha(aToken) : 1;
  if ([r, g, b, a].some(Number.isNaN) || a <= 0) return null;
  return {
    hex: rgbToHex(r, g, b),
    rgb: `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`,
  };
}
