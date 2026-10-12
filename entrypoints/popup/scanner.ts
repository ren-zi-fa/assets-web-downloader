export interface ScannedImage {
  url: string;
  alt: string;
  width: number;
  height: number;
  source: 'img' | 'srcset' | 'picture' | 'poster' | 'lazy' | 'background' | 'icon' | 'meta';
}

/**
 * Dijalankan di dalam halaman web via `browser.scripting.executeScript`.
 * WAJIB self-contained: tidak boleh import atau menutup (closure) variabel
 * dari luar, karena fungsi ini diserialisasi dan dikirim ke tab target.
 */
export function scanPageImages(): ScannedImage[] {
  const seen = new Map<string, ScannedImage>();

  const toAbs = (src: string): string | null => {
    try {
      const u = new URL(src, location.href);
      if (u.protocol !== 'http:' && u.protocol !== 'https:' && u.protocol !== 'data:') {
        return null;
      }
      return u.href;
    } catch {
      return null;
    }
  };

  const add = (
    raw: string | null,
    alt: string,
    w: number,
    h: number,
    source: ScannedImage['source'],
  ): void => {
    if (!raw) return;
    const url = toAbs(raw.trim());
    if (!url || seen.has(url)) return;
    seen.set(url, { url, alt: (alt || '').slice(0, 120), width: w || 0, height: h || 0, source });
  };

  // "a.jpg 320w, b.jpg 640w" -> URL dengan deskriptor terbesar
  const pickFromSrcset = (srcset: string): string | null => {
    let best: string | null = null;
    let bestW = -1;
    for (const part of srcset.split(',')) {
      const tokens = part.trim().split(/\s+/);
      if (!tokens[0]) continue;
      const desc = tokens[1] || '';
      if (desc.endsWith('w')) {
        const w = parseInt(desc, 10);
        if (!Number.isNaN(w) && w > bestW) {
          bestW = w;
          best = tokens[0];
        }
      } else if (best === null) {
        best = tokens[0];
      }
    }
    return best;
  };

  // 1. <img>: src / currentSrc / srcset / atribut lazy-load umum
  document.querySelectorAll('img').forEach((node) => {
    const el = node as HTMLImageElement;
    if (el.srcset) {
      const best = pickFromSrcset(el.srcset);
      if (best) add(best, el.alt, el.naturalWidth, el.naturalHeight, 'srcset');
    }
    add(el.currentSrc || el.src, el.alt, el.naturalWidth, el.naturalHeight, 'img');
    for (const attr of ['data-src', 'data-lazy-src', 'data-original']) {
      add(el.getAttribute(attr), el.alt, el.naturalWidth, el.naturalHeight, 'lazy');
    }
  });

  // 2. <picture><source srcset>
  document.querySelectorAll('picture source').forEach((node) => {
    const srcset = node.getAttribute('srcset');
    if (srcset) {
      const best = pickFromSrcset(srcset);
      if (best) add(best, '', 0, 0, 'picture');
    }
    add(node.getAttribute('src'), '', 0, 0, 'picture');
  });

  // 3. Poster <video>
  document.querySelectorAll('video[poster]').forEach((node) => {
    const v = node as HTMLVideoElement;
    add(node.getAttribute('poster'), '', v.videoWidth, v.videoHeight, 'poster');
  });

  // 4. CSS background-image (inline style maupun dari stylesheet).
  //    Dibaca via computed style karena kartu portfolio React biasanya
  //    memakai style={{ backgroundImage }}. Dibatasi 5000 elemen.
  const bgUrlRe = /url\(["']?([^"')]+)["']?\)/g;
  const addBackgrounds = (cssText: string | null): void => {
    if (!cssText || cssText === 'none') return;
    bgUrlRe.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = bgUrlRe.exec(cssText)) !== null) {
      if (m[1]) add(m[1], '', 0, 0, 'background');
    }
  };
  const all = document.querySelectorAll('*');
  const limit = Math.min(all.length, 5000);
  for (let i = 0; i < limit; i++) {
    const el = all[i] as HTMLElement;
    if (el.style && el.style.backgroundImage && el.style.backgroundImage !== 'none') {
      addBackgrounds(el.style.backgroundImage);
    } else {
      addBackgrounds(getComputedStyle(el).backgroundImage);
    }
  }

  // 5. Favicon & resource hints di <head>
  document
    .querySelectorAll('link[rel="icon"], link[rel="shortcut icon"], link[rel="apple-touch-icon"], link[rel="image_src"]')
    .forEach((node) => {
      add(node.getAttribute('href'), 'favicon', 0, 0, 'icon');
    });

  // 6. Meta og:image / twitter:image
  document
    .querySelectorAll('meta[property="og:image"], meta[name="twitter:image"]')
    .forEach((node) => {
      add(node.getAttribute('content'), 'meta', 0, 0, 'meta');
    });

  return [...seen.values()].slice(0, 500);
}
