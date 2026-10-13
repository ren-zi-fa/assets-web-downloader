import type { ScanResult } from '../../shared/scan';

export interface ScannedImage {
  url: string;
  alt: string;
  width: number;
  height: number;
  source: 'img' | 'srcset' | 'picture' | 'poster' | 'lazy' | 'background' | 'icon' | 'meta';
}

/**
 * Dijalankan di dalam halaman web via `browser.scripting.executeScript`.
 * WAJIB self-contained: tidak boleh import, tidak boleh memanggil helper
 * level-modul, dan tidak boleh menutup (closure) variabel dari luar —
 * hanya source fungsi INI yang diserialisasi dan dikirim ke tab target.
 * Helper kecil (toAbs, regex url) SENGAJA duplikat per fitur karena
 * aturan ini — lihat versi kanonis sisi-popup di `shared/url.ts`.
 * Helper di bawah didefinisikan BERSARANG agar ikut terserialisasi.
 *
 * Iframe same-origin (mis. panel hasil W3Schools tryit) ditelusuri
 * rekursif; iframe cross-origin dilewati aman.
 */
export function scanPageImages(): ScanResult<ScannedImage> {
  /** Batas hasil yang dikirim ke popup agar halaman tetap ringan. */
  const MAX_RESULTS = 500;
  /** Panjang maksimum teks alt yang disimpan. */
  const ALT_MAX = 120;
  /** Batas jumlah elemen yang diperiksa untuk background-image. */
  const BG_ELEM_LIMIT = 5000;

  const seen = new Map<string, ScannedImage>();

  type AddImage = (
    raw: string | null,
    alt: string,
    w: number,
    h: number,
    source: ScannedImage['source'],
    base: string,
  ) => void;

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
      if (u.protocol !== 'http:' && u.protocol !== 'https:' && u.protocol !== 'data:') {
        return null;
      }
      return u.href;
    } catch {
      return null;
    }
  };

  /**
   * CDN images.pexels.com mengizinkan minta ukuran berapa pun lewat param
   * w/h (gaya imgix). Halaman grid hanya memuat varian kecil (w=350/700)
   * agar hemat bandwidth, padahal file aslinya ribuan piksel. Naikkan sisi
   * terpanjang ke PEXELS_MAX_SIDE dengan aspek tetap, agar yang diunduh
   * setara "jelas" seperti yang terlihat di situs. Varian kecil hasil
   * upgrade ini menyatu menjadi satu URL (dedupe di add).
   */
  const PEXELS_MAX_SIDE = 1920;
  const upgradeCdnSize = (url: string): string => {
    try {
      const u = new URL(url);
      if (u.hostname !== 'images.pexels.com') return url;
      const w = parseInt(u.searchParams.get('w') || '', 10);
      const h = parseInt(u.searchParams.get('h') || '', 10);
      if (!w || Number.isNaN(w)) return url;
      const longSide = Math.max(w, Number.isNaN(h) ? 0 : h);
      if (longSide >= PEXELS_MAX_SIDE) return url;
      const scale = PEXELS_MAX_SIDE / longSide;
      u.searchParams.set('w', String(Math.round(w * scale)));
      if (h && !Number.isNaN(h)) u.searchParams.set('h', String(Math.round(h * scale)));
      u.searchParams.delete('dpr'); // dpr dikali w; setelah w dibesarkan tak perlu lagi
      return u.href;
    } catch {
      return url;
    }
  };

  const add: AddImage = (raw, alt, w, h, source, base) => {
    if (!raw) return;
    const absolute = toAbs(raw.trim(), base);
    if (!absolute) return;
    const url = upgradeCdnSize(absolute);
    if (seen.has(url)) return;
    seen.set(url, {
      url,
      alt: (alt || '').slice(0, ALT_MAX),
      width: w || 0,
      height: h || 0,
      source,
    });
  };

  // "a.jpg 320w, b.jpg 640w" -> URL dengan deskriptor terbesar.
  // Deskriptor x ("a.jpg 1x, b.jpg 2x") juga didukung: pemenang-x dipakai
  // hanya jika tidak ada deskriptor w (keduanya tak pernah dicampur).
  const pickFromSrcset = (srcset: string): string | null => {
    let bestW: string | null = null;
    let bestWValue = -1;
    let bestX: string | null = null;
    let bestXValue = -1;
    for (const part of srcset.split(',')) {
      const tokens = part.trim().split(/\s+/);
      if (!tokens[0]) continue;
      const desc = tokens[1] || '';
      if (desc.endsWith('w')) {
        const w = parseInt(desc, 10);
        if (!Number.isNaN(w) && w > bestWValue) {
          bestWValue = w;
          bestW = tokens[0];
        }
      } else if (desc.endsWith('x')) {
        const x = parseFloat(desc);
        if (!Number.isNaN(x) && x > bestXValue) {
          bestXValue = x;
          bestX = tokens[0];
        }
      } else if (bestW === null && bestX === null) {
        bestW = tokens[0];
      }
    }
    return bestW ?? bestX;
  };

  /** <img>: src / currentSrc / srcset / atribut lazy-load umum. */
  const collectImgElements = (doc: Document, base: string): void => {
    doc.querySelectorAll('img').forEach((node) => {
      const el = node as HTMLImageElement;
      if (el.srcset) {
        const best = pickFromSrcset(el.srcset);
        if (best) add(best, el.alt, el.naturalWidth, el.naturalHeight, 'srcset', base);
      }
      add(el.currentSrc || el.src, el.alt, el.naturalWidth, el.naturalHeight, 'img', base);
      for (const attr of ['data-src', 'data-lazy-src', 'data-original']) {
        add(el.getAttribute(attr), el.alt, el.naturalWidth, el.naturalHeight, 'lazy', base);
      }
    });
  };

  /** <picture><source srcset>. */
  const collectPictureSources = (doc: Document, base: string): void => {
    doc.querySelectorAll('picture source').forEach((node) => {
      const srcset = node.getAttribute('srcset');
      if (srcset) {
        const best = pickFromSrcset(srcset);
        if (best) add(best, '', 0, 0, 'picture', base);
      }
      add(node.getAttribute('src'), '', 0, 0, 'picture', base);
    });
  };

  /** Poster <video>. */
  const collectVideoPosters = (doc: Document, base: string): void => {
    doc.querySelectorAll('video[poster]').forEach((node) => {
      const v = node as HTMLVideoElement;
      add(node.getAttribute('poster'), '', v.videoWidth, v.videoHeight, 'poster', base);
    });
  };

  /**
   * CSS background-image (inline style maupun dari stylesheet).
   * Kartu portfolio React biasanya memakai style={{ backgroundImage }}.
   * Dibatasi 5000 elemen per dokumen.
   */
  const collectBackgroundImages = (doc: Document, base: string): void => {
    const bgUrlRe = /url\(["']?([^"')]+)["']?\)/g;
    const addBackgrounds = (cssText: string | null): void => {
      if (!cssText || cssText === 'none') return;
      bgUrlRe.lastIndex = 0;
      let m: RegExpExecArray | null;
      while ((m = bgUrlRe.exec(cssText)) !== null) {
        if (m[1]) add(m[1], '', 0, 0, 'background', base);
      }
    };
    const all = doc.querySelectorAll('*');
    const limit = Math.min(all.length, BG_ELEM_LIMIT);
    for (let i = 0; i < limit; i++) {
      const el = all[i] as HTMLElement;
      if (el.style && el.style.backgroundImage && el.style.backgroundImage !== 'none') {
        addBackgrounds(el.style.backgroundImage);
      } else {
        addBackgrounds(getComputedStyle(el).backgroundImage);
      }
    }
  };

  /** Favicon, apple-touch-icon, dan meta og:image / twitter:image. */
  const collectHeadImages = (doc: Document, base: string): void => {
    doc
      .querySelectorAll(
        'link[rel="icon"], link[rel="shortcut icon"], link[rel="apple-touch-icon"], link[rel="image_src"]',
      )
      .forEach((node) => {
        add(node.getAttribute('href'), 'favicon', 0, 0, 'icon', base);
      });
    doc
      .querySelectorAll('meta[property="og:image"], meta[name="twitter:image"]')
      .forEach((node) => {
        add(node.getAttribute('content'), 'meta', 0, 0, 'meta', base);
      });
  };

  const visit = (doc: Document): void => {
    const base = baseOf(doc);
    collectImgElements(doc, base);
    collectPictureSources(doc, base);
    collectVideoPosters(doc, base);
    collectBackgroundImages(doc, base);
    collectHeadImages(doc, base);
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

  const all = [...seen.values()];
  return { items: all.slice(0, MAX_RESULTS), total: all.length };
}
