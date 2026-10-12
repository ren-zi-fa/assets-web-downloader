import type { ScanResult } from '../../shared/scan';

export interface ScannedFont {
  family: string;
  detail: string;
  urls: string[];
  origin: 'font-face' | 'google' | 'page';
}

/**
 * Dipindai di dalam halaman via `browser.scripting.executeScript`.
 * WAJIB self-contained seperti scanPageImages: semua helper BERSARANG
 * agar ikut terserialisasi. Lihat catatan duplikasi di images/scanner.ts.
 *
 * Sumber: aturan @font-face stylesheet same-origin (ada URL file -> bisa
 * diunduh), <link> Google Fonts (nama keluarga saja), dan font yang
 * benar-benar dipakai (computed style, termasuk font sistem).
 * Iframe same-origin ditelusuri rekursif; cross-origin dilewati aman.
 */
export function scanPageFonts(): ScanResult<ScannedFont> {
  const map = new Map<string, ScannedFont>();

  const baseOf = (doc: Document): string => {
    try {
      return doc.baseURI || location.href;
    } catch {
      return location.href;
    }
  };

  const toAbs = (src: string, base: string): string | null => {
    try {
      const u = new URL(src, base);
      if (u.protocol !== 'http:' && u.protocol !== 'https:') return null;
      return u.href;
    } catch {
      return null;
    }
  };

  const cleanFamily = (raw: string): string =>
    (raw.split(',')[0] ?? '').trim().replace(/^['"]+|['"]+$/g, '');

  const ensure = (familyRaw: string, origin: ScannedFont['origin']): ScannedFont | null => {
    const family = cleanFamily(familyRaw);
    if (!family) return null;
    let entry = map.get(family);
    if (!entry) {
      entry = { family, detail: '', urls: [], origin };
      map.set(family, entry);
    }
    return entry;
  };

  const addUrls = (entry: ScannedFont, src: string | null, base: string): void => {
    if (!src) return;
    const re = /url\(["']?([^"')]+)["']?\)/g;
    re.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = re.exec(src)) !== null) {
      if (!m[1]) continue;
      const u = toAbs(m[1].trim(), base);
      if (u && !entry.urls.includes(u)) entry.urls.push(u);
    }
  };

  const addDetail = (entry: ScannedFont, d: string): void => {
    const t = d.trim();
    if (!t) return;
    entry.detail = entry.detail ? `${entry.detail}, ${t}` : t;
  };

  // Aturan @font-face (stylesheet cross-origin dilewati aman).
  // type 5 === CSSRule.FONT_FACE_RULE.
  const collectFontFaces = (doc: Document, base: string): void => {
    const walkRules = (rules: CSSRuleList | null | undefined): void => {
      if (!rules) return;
      for (const r of Array.from(rules)) {
        if (r.type === 5) {
          const style = (r as CSSFontFaceRule).style;
          const entry = ensure(style.getPropertyValue('font-family'), 'font-face');
          if (!entry) continue;
          addUrls(entry, style.getPropertyValue('src'), base);
          addDetail(
            entry,
            `${style.getPropertyValue('font-weight')} ${style.getPropertyValue('font-style')}`.trim(),
          );
        } else if ((r as CSSGroupingRule).cssRules) {
          walkRules((r as CSSGroupingRule).cssRules);
        }
      }
    };
    for (const sheet of Array.from(doc.styleSheets)) {
      try {
        walkRules(sheet.cssRules);
      } catch {
        continue; // stylesheet cross-origin: tidak boleh dibaca browser
      }
    }
  };

  // <link> Google Fonts -> nama keluarga (tanpa URL file).
  const collectGoogleFontsLinks = (doc: Document): void => {
    doc.querySelectorAll('link[href*="fonts.googleapis.com"]').forEach((node) => {
      const href = node.getAttribute('href') || '';
      for (const part of href.split(/[&?]/)) {
        if (!part.startsWith('family=')) continue;
        const name = decodeURIComponent((part.slice(7).split(':')[0] ?? '').replace(/\+/g, ' '));
        ensure(name, 'google');
      }
    });
  };

  // Font yang benar-benar dipakai di halaman (termasuk font sistem).
  const collectUsedFonts = (doc: Document): void => {
    const all = doc.querySelectorAll('*');
    const limit = Math.min(all.length, 2000);
    const used = new Map<string, number>();
    for (let i = 0; i < limit; i++) {
      const ff = getComputedStyle(all[i] as Element).fontFamily;
      if (!ff) continue;
      const first = cleanFamily(ff);
      if (first) used.set(first, (used.get(first) || 0) + 1);
    }
    used.forEach((count, fam) => {
      const entry = ensure(fam, 'page');
      if (entry && !entry.detail) entry.detail = `used by ~${count} elements`;
    });
  };

  const visit = (doc: Document): void => {
    const base = baseOf(doc);
    collectFontFaces(doc, base);
    collectGoogleFontsLinks(doc);
    collectUsedFonts(doc);
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

  const all = [...map.values()].sort(
    (a, b) => b.urls.length - a.urls.length || a.family.localeCompare(b.family),
  );
  return { items: all.slice(0, 200), total: all.length };
}
