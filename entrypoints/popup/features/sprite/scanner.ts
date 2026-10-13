import type { ScanResult } from '../../shared/scan';

export interface ScannedSprite {
  url: string;
  /** 'sheet' = file sprite utuh, 'frame' = snapshot canvas saat Analyze ditekan. */
  kind: 'sheet' | 'frame';
  width: number;
  height: number;
  /** Keterangan singkat: sumber deteksi atau alasan tak bisa diunduh. */
  detail: string;
  /** Bisa di-download. Snapshot dari canvas tainted tidak bisa. */
  downloadable: boolean;
}

/**
 * Pemindai DOM (ISOLATED world) untuk SPRITE — animasi yang dijalankan di
 * atas <canvas>. Sengaja dipisah dari `images/scanner.ts`: sprite adalah
 * animasi berbingkai, bukan gambar halaman biasa, dan halaman game sering
 * memuatnya via JS tanpa pernah menempelkannya ke DOM.
 *
 * WAJIB self-contained seperti pemindai lain (hanya source fungsi ini yang
 * diserialisasi ke tab target — lihat catatan di images/scanner.ts).
 *
 * Cara kerja:
 * 1. `performance.getEntriesByType('resource')` — mencatat SEMUA gambar yang
 *    dimuat halaman lewat jaringan (termasuk sprite sheet milik game yang
 *    di-draw via JS). Umumnya inilah file sprite sheet aslinya.
 * 2. Tiap <canvas> di-snapshot ke PNG data URL via `toDataURL`. Canvas yang
 *    memuat gambar cross-origin tanpa CORS akan "tainted" dan menolak
 *    toDataURL — kasus ini ditandai tak bisa diunduh agar UI jujur.
 *
 * Iframe same-origin ditelusuri rekursif; cross-origin dilewati aman.
 */
export function scanPageSprites(): ScanResult<ScannedSprite> {
  const IMAGE_EXTS = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'avif', 'bmp', 'ico'];
  /** Batas hasil yang dikirim ke popup agar halaman tetap ringan. */
  const MAX_RESULTS = 200;
  /** Data URL di atas panjang ini dilewati (hasil toDataURL bisa sangat besar). */
  const DATA_URL_MAX = 2048;

  const seen = new Map<string, ScannedSprite>();

  const toAbs = (raw: string, base: string): string | null => {
    try {
      const u = new URL(raw, base);
      if (u.protocol !== 'http:' && u.protocol !== 'https:' && u.protocol !== 'data:') {
        return null;
      }
      return u.href;
    } catch {
      return null;
    }
  };

  const extOf = (url: string): string => {
    try {
      if (url.startsWith('data:')) {
        const m = /^data:image\/([a-z0-9.+-]+)[;,]/i.exec(url);
        return (m?.[1] ?? '').toLowerCase();
      }
      const path = new URL(url).pathname.split('/').pop() ?? '';
      return path.includes('.') ? path.split('.').pop()!.toLowerCase() : '';
    } catch {
      return '';
    }
  };

  const looksImage = (url: string): boolean => {
    if (url.startsWith('data:image/')) return true;
    return IMAGE_EXTS.includes(extOf(url));
  };

  const add = (
    url: string,
    kind: ScannedSprite['kind'],
    width: number,
    height: number,
    detail: string,
  ): void => {
    if (!url || seen.has(url)) return;
    seen.set(url, {
      url,
      kind,
      width: width || 0,
      height: height || 0,
      detail,
      downloadable: true,
    });
  };

  /** Snapshot satu <canvas>. `index` hanya untuk kunci baris tainted. */
  const addCanvas = (canvas: HTMLCanvasElement, index: number): void => {
    const width = canvas.width || 0;
    const height = canvas.height || 0;
    if (width === 0 || height === 0) return;
    let dataUrl: string | null = null;
    let tainted = false;
    try {
      dataUrl = canvas.toDataURL('image/png');
    } catch {
      tainted = true; // gambar cross-origin tanpa CORS: canvas tak boleh dibaca
    }
    if (dataUrl) {
      add(dataUrl, 'frame', width, height, 'snapshot of <canvas>');
      return;
    }
    if (tainted) {
      const key = `canvas-tainted-${index}`;
      if (!seen.has(key)) {
        seen.set(key, {
          url: '',
          kind: 'frame',
          width,
          height,
          detail: 'canvas snapshot blocked (cross-origin image without CORS)',
          downloadable: false,
        });
      }
    }
  };

  /**
   * Gambar yang dimuat halaman — sumber sprite sheet asli (game/animasi
   * canvas biasanya mengambil sheet lewat fetch/Image, bukan <img> di DOM).
   * Dikumpulkan terakhir supaya sheet asli muncul di daftar atas.
   */
  const collectNetworkImages = (): void => {
    try {
      for (const entry of performance.getEntriesByType('resource') as PerformanceResourceTiming[]) {
        const url = toAbs(entry.name, location.href);
        if (!url) continue;
        if (!looksImage(url)) continue;
        // Lewati hasil toDataURL (panjang) dan blob internal.
        if (url.startsWith('data:') && url.length > DATA_URL_MAX) continue;
        seen.set(url, {
          url,
          kind: 'sheet',
          width: 0,
          height: 0,
          detail: 'loaded by the page (likely a sprite sheet)',
          downloadable: true,
        });
      }
    } catch {
      /* Resource Timing tak tersedia: cukup andalkan snapshot canvas */
    }
  };

  const visit = (doc: Document): void => {
    let index = 0;
    doc.querySelectorAll('canvas').forEach((node) => {
      addCanvas(node as HTMLCanvasElement, index++);
    });
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
  collectNetworkImages();

  const all = [...seen.values()];
  return { items: all.slice(0, MAX_RESULTS), total: all.length };
}

/**
 * Pemindai MAIN world untuk SPRITE: menutup celah yang tak terlihat DOM.
 *
 * Halaman game menganimasikan sprite dengan menggambar file sprite sheet ke
 * canvas via `drawImage`, dan sering menggambarnya ke WebGL
 * (`texImage2D`/`texSubImage2D`) untuk batching. Hook di bawah mencatat URL
 * gambar yang dipakai menggambar, lalu hasilnya diakumulasi di `globalThis`
 * (idempoten) supaya tiap Analyze cukup membaca riwayatnya.
 *
 * Cara kerja:
 * - snapshot `drawImage` segera saat dipanggil (jika argumen 1 elemen gambar),
 * - `texImage2D`/`texSubImage2D` dengan argumen sumber gambar/ImageBitmap,
 * - `HTMLImageElement.prototype.src` setter — menangkap pembuatan `new Image()`
 *   yang dipakai memuat sprite sheet.
 *
 * Semua hook dibungkus try/catch: kegagalan di sini tidak boleh mengganggu
 * animasi halaman.
 */
export function scanSpriteSources(): ScanResult<ScannedSprite> {
  const IMAGE_EXTS = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'avif', 'bmp', 'ico'];

  const scope = globalThis as typeof globalThis & {
    __assetSpriteSeen?: Set<string>;
    __assetSpriteHooked?: boolean;
  };
  const seen: Set<string> =
    scope.__assetSpriteSeen ?? (scope.__assetSpriteSeen = new Set<string>());

  const toAbs = (raw: string): string | null => {
    try {
      const u = new URL(raw, location.href);
      if (u.protocol !== 'http:' && u.protocol !== 'https:' && u.protocol !== 'data:') return null;
      return u.href;
    } catch {
      return null;
    }
  };

  const extOf = (url: string): string => {
    try {
      if (url.startsWith('data:')) {
        const m = /^data:image\/([a-z0-9.+-]+)[;,]/i.exec(url);
        return (m?.[1] ?? '').toLowerCase();
      }
      const path = new URL(url).pathname.split('/').pop() ?? '';
      const dot = path.lastIndexOf('.');
      if (dot < 0) return '';
      return path.slice(dot + 1).toLowerCase();
    } catch {
      return '';
    }
  };

  const looksImage = (url: string): boolean => {
    if (url.startsWith('data:image/')) return true;
    return IMAGE_EXTS.includes(extOf(url));
  };

  /** Ambil URL dari sumber drawImage/texture: elemen gambar atau ImageBitmap. */
  const sourceUrlOf = (source: unknown): string | null => {
    try {
      if (source instanceof HTMLImageElement) return source.currentSrc || source.src || null;
      if (source instanceof SVGImageElement) return source.href?.baseVal || null;
      if (typeof ImageBitmap !== 'undefined' && source instanceof ImageBitmap) {
        return 'imagebitmap:';
      }
    } catch {
      /* sumber tak dikenal */
    }
    return null;
  };

  const record = (raw: string | null): void => {
    if (typeof raw !== 'string' || raw.length === 0) return;
    const url = toAbs(raw);
    if (url && looksImage(url)) seen.add(url);
  };

  if (!scope.__assetSpriteHooked) {
    scope.__assetSpriteHooked = true;

    const canvasProto = globalThis.CanvasRenderingContext2D?.prototype;
    const originalDrawImage = canvasProto?.drawImage;
    if (originalDrawImage) {
      canvasProto!.drawImage = function (
        this: CanvasRenderingContext2D,
        source: CanvasImageSource,
        ...rest: unknown[]
      ) {
        try {
          record(sourceUrlOf(source));
        } catch {
          /* biarkan penggambaran tetap jalan */
        }
        return (originalDrawImage as (...args: unknown[]) => void).call(this, source, ...rest);
      } as typeof canvasProto.drawImage;
    }

    const glProto = globalThis.WebGLRenderingContext?.prototype;
    const originalTexImage2D = glProto?.texImage2D;
    if (glProto && originalTexImage2D) {
      glProto.texImage2D = function (this: WebGLRenderingContext, ...args: unknown[]) {
        try {
          // Argumen pertama yang menghasilkan URL = sumber gambar tekstur.
          // Argumen angka/level tidak pernah jadi sumber.
          for (const arg of args) {
            const url = sourceUrlOf(arg);
            if (url !== null) {
              record(url);
              break;
            }
          }
        } catch {
          /* biarkan upload tekstur tetap jalan */
        }
        return (originalTexImage2D as (...a: unknown[]) => void).apply(this, args);
      } as typeof glProto.texImage2D;
    }

    const originalImgSrc = Object.getOwnPropertyDescriptor(HTMLImageElement.prototype, 'src');
    if (originalImgSrc?.get && originalImgSrc.set) {
      const setSrc = originalImgSrc.set;
      Object.defineProperty(HTMLImageElement.prototype, 'src', {
        configurable: true,
        enumerable: originalImgSrc.enumerable,
        get: originalImgSrc.get,
        set(this: HTMLImageElement, value: string) {
          try {
            record(value);
          } catch {
            /* biarkan pemasangan src tetap jalan */
          }
          setSrc.call(this, value);
        },
      });
    }
  }

  const items: ScannedSprite[] = [...seen].map((url) => ({
    url,
    kind: 'sheet',
    width: 0,
    height: 0,
    detail: 'used by canvas draw (from page JS)',
    downloadable: true,
  }));
  return { items, total: items.length };
}
