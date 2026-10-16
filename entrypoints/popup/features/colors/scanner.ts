import type { ScanResult } from '../../shared/scan';

export interface ScannedColor {
  /** '#RRGGBB' huruf besar. */
  hex: string;
  /** 'rgb(r, g, b)'. */
  rgb: string;
  /** Berapa kali warna ini muncul di halaman (elemen/atribut). */
  count: number;
  /** Ringkasan sumber, mis. "text, background, svg". */
  sources: string;
}

/**
 * Dijalankan di dalam halaman web via `browser.scripting.executeScript`.
 * WAJIB self-contained seperti `scanPageImages`: helper warna di bawah
 * SENGAJA diduplikasi dari versi kanonis `shared/color.ts` karena fungsi
 * pemindai diserialisasi tanpa import — lihat catatan di
 * `features/images/scanner.ts`.
 *
 * Sumber: computed style elemen (teks, background, border, outline),
 * atribut fill/stroke SVG inline, dan meta theme-color. Iframe same-origin
 * ditelusuri rekursif; iframe cross-origin dilewati aman.
 */
export function scanPageColors(): ScanResult<ScannedColor> {
  /** Batas hasil yang dikirim ke popup agar halaman tetap ringan. */
  const MAX_RESULTS = 300;
  /** Batas jumlah elemen yang diperiksa computed style-nya. */
  const ELEM_LIMIT = 3000;

  const map = new Map<string, { hex: string; rgb: string; count: number; sources: Set<string> }>();

  const toHex = (value: number): string =>
    Math.max(0, Math.min(255, Math.round(value)))
      .toString(16)
      .padStart(2, '0');

  const rgbToHex = (r: number, g: number, b: number): string =>
    `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();

  const parseHex = (value: string): [number, number, number, number] | null => {
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
  };

  const channel = (token: string): number =>
    token.endsWith('%') ? (parseFloat(token) / 100) * 255 : parseFloat(token);

  const alphaOf = (token: string): number =>
    token.endsWith('%') ? parseFloat(token) / 100 : parseFloat(token);

  /** Nilai warna CSS apa pun → { hex, rgb }, atau null bila bukan warna solid. */
  const normalize = (input: string): { hex: string; rgb: string } | null => {
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
    const a = aToken ? alphaOf(aToken) : 1;
    if ([r, g, b, a].some(Number.isNaN) || a <= 0) return null;
    return {
      hex: rgbToHex(r, g, b),
      rgb: `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`,
    };
  };

  const add = (raw: string | null | undefined, source: string): void => {
    if (!raw) return;
    const color = normalize(raw);
    if (!color) return;
    let entry = map.get(color.hex);
    if (!entry) {
      entry = { hex: color.hex, rgb: color.rgb, count: 0, sources: new Set<string>() };
      map.set(color.hex, entry);
    }
    entry.count++;
    entry.sources.add(source);
  };

  /** Computed style elemen: warna yang benar-benar dipakai halaman. */
  const collectComputed = (doc: Document): void => {
    const all = doc.querySelectorAll('*');
    const limit = Math.min(all.length, ELEM_LIMIT);
    for (let i = 0; i < limit; i++) {
      const style = getComputedStyle(all[i] as Element);
      add(style.getPropertyValue('color'), 'text');
      add(style.getPropertyValue('background-color'), 'background');
      // border/outline-color resolve ke currentColor walau tak ada garis,
      // jadi hanya dihitung saat garisnya benar-benar ada.
      const sides: Array<[string, string]> = [
        ['border-top-width', 'border-top-color'],
        ['border-right-width', 'border-right-color'],
        ['border-bottom-width', 'border-bottom-color'],
        ['border-left-width', 'border-left-color'],
      ];
      for (const [width, color] of sides) {
        if (parseFloat(style.getPropertyValue(width)) > 0) {
          add(style.getPropertyValue(color), 'border');
        }
      }
      if (
        style.getPropertyValue('outline-style') !== 'none' &&
        parseFloat(style.getPropertyValue('outline-width')) > 0
      ) {
        add(style.getPropertyValue('outline-color'), 'outline');
      }
    }
  };

  /** Atribut fill/stroke SVG inline. */
  const collectSvgColors = (doc: Document): void => {
    doc.querySelectorAll('[fill], [stroke]').forEach((node) => {
      add(node.getAttribute('fill'), 'svg');
      add(node.getAttribute('stroke'), 'svg');
    });
  };

  /** <meta name="theme-color">. */
  const collectThemeColor = (doc: Document): void => {
    doc.querySelectorAll('meta[name="theme-color"]').forEach((node) => {
      add(node.getAttribute('content'), 'theme');
    });
  };

  const visit = (doc: Document): void => {
    collectComputed(doc);
    collectSvgColors(doc);
    collectThemeColor(doc);
  };

  const visited = new Set<Document>();
  const walk = (doc: Document | null | undefined): void => {
    if (!doc || visited.has(doc)) return;
    visited.add(doc);
    visit(doc);
    doc.querySelectorAll('iframe').forEach((node) => {
      let inner: Document | null = null;
      try {
        inner = (node as HTMLIFrameElement).contentDocument;
      } catch {
        inner = null; // iframe cross-origin: tak boleh dibaca
      }
      walk(inner);
    });
  };
  walk(document);

  const all = [...map.values()].sort((a, b) => b.count - a.count || a.hex.localeCompare(b.hex));
  const items = all.slice(0, MAX_RESULTS).map((entry) => ({
    hex: entry.hex,
    rgb: entry.rgb,
    count: entry.count,
    sources: [...entry.sources].sort().join(', '),
  }));
  return { items, total: all.length };
}
