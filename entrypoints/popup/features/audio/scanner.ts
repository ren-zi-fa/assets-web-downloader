export interface ScannedAudio {
  url: string;
  /** Judul asli jika ada, string kosong jika tidak diketahui (UI pakai nama file). */
  title: string;
  ext: string;
  kind: 'audio' | 'source' | 'link' | 'video' | 'stream' | 'network';
  playable: boolean;
}

/**
 * Dipindai di dalam halaman via `browser.scripting.executeScript`.
 * WAJIB self-contained seperti scanner lainnya: helper DAN konstanta
 * didefinisikan BERSARANG di dalam fungsi ini (hanya source fungsi yang
 * diserialisasi ke tab target — lihat catatan di images/scanner.ts).
 *
 * Sumber: elemen <audio>, <source>, <video> (ada track suara), link <a>
 * yang mengarah ke file audio, dan meta og:audio. URL blob: dan playlist
 * HLS/DASH (.m3u8/.mpd) ditandai tak bisa diputar/diunduh dari extension.
 * Iframe same-origin ditelusuri rekursif; cross-origin dilewati aman.
 *
 * Catatan: situs yang memutar audio via Web Audio API (mis. howler.js) atau
 * `new Audio()` tanpa menempel ke DOM TIDAK akan terlihat di sini — itu
 * ditangani oleh `scanAudioNetwork` (MAIN world).
 */
export function scanPageAudio(): ScannedAudio[] {
  const AUDIO_EXTS = ['mp3', 'wav', 'ogg', 'oga', 'm4a', 'aac', 'flac', 'opus', 'weba', 'mid', 'midi'];
  /** Playlist streaming (HLS/DASH): bukan file musik, tak bisa diunduh langsung. */
  const PLAYLIST_EXTS = ['m3u8', 'mpd', 'm3u', 'pls'];

  const seen = new Map<string, ScannedAudio>();

  const baseOf = (doc: Document): string => {
    try {
      return doc.baseURI || location.href;
    } catch {
      return location.href;
    }
  };

  const toAbs = (src: string, base: string): { url: string; blob: boolean } | null => {
    try {
      const u = new URL(src, base);
      if (u.protocol === 'blob:') return { url: u.href, blob: true };
      if (u.protocol !== 'http:' && u.protocol !== 'https:' && u.protocol !== 'data:') return null;
      return { url: u.href, blob: false };
    } catch {
      return null;
    }
  };

  const extOf = (url: string): string => {
    try {
      const path = new URL(url).pathname.split('/').pop() || '';
      const ext = ((path.split('.').pop() || '').toLowerCase().split('?')[0] ?? '');
      return AUDIO_EXTS.includes(ext) ? ext : '';
    } catch {
      return '';
    }
  };

  const looksAudio = (url: string): boolean => {
    if (url.startsWith('data:audio/')) return true;
    return extOf(url) !== '';
  };

  const playlistExtOf = (url: string): string => {
    try {
      const path = new URL(url).pathname.split('/').pop() || '';
      const ext = ((path.split('.').pop() || '').toLowerCase().split('?')[0] ?? '');
      return PLAYLIST_EXTS.includes(ext) ? ext : '';
    } catch {
      return '';
    }
  };

  const add = (raw: string | null, title: string, kind: ScannedAudio['kind'], base: string): void => {
    if (!raw) return;
    const parsed = toAbs(raw.trim(), base);
    if (!parsed || seen.has(parsed.url)) return;
    if (parsed.blob) {
      seen.set(parsed.url, {
        url: parsed.url,
        title: title || 'aliran blob',
        ext: '',
        kind,
        playable: false,
      });
      return;
    }
    const playlistExt = playlistExtOf(parsed.url);
    if (playlistExt) {
      seen.set(parsed.url, {
        url: parsed.url,
        title: title.slice(0, 120),
        ext: playlistExt,
        kind: 'stream',
        playable: false,
      });
      return;
    }
    if (kind === 'link' && !looksAudio(parsed.url)) return;
    seen.set(parsed.url, {
      url: parsed.url,
      title: title.slice(0, 120),
      ext: extOf(parsed.url),
      kind,
      playable: true,
    });
  };

  /** <audio src> + <audio><source>. */
  const collectAudioElements = (doc: Document, base: string): void => {
    doc.querySelectorAll('audio').forEach((node) => {
      const el = node as HTMLAudioElement;
      const label = el.title || el.getAttribute('aria-label') || '';
      add(el.currentSrc || el.src, label, 'audio', base);
      el.querySelectorAll('source').forEach((s) => {
        add(s.getAttribute('src'), label, 'source', base);
      });
    });
  };

  /** <video src> + <video><source> (video mengandung track suara). */
  const collectVideoElements = (doc: Document, base: string): void => {
    doc.querySelectorAll('video').forEach((node) => {
      const el = node as HTMLVideoElement;
      const label = el.title || 'video (ada suara)';
      add(el.currentSrc || el.src, label, 'video', base);
      el.querySelectorAll('source').forEach((s) => {
        add(s.getAttribute('src'), label, 'video', base);
      });
    });
  };

  /** Link langsung ke file audio. */
  const collectAudioLinks = (doc: Document, base: string): void => {
    doc.querySelectorAll('a[href]').forEach((node) => {
      const href = node.getAttribute('href');
      const text = (node.textContent || '').trim().slice(0, 80);
      add(href, text, 'link', base);
    });
  };

  /** Meta og:audio / twitter:player:stream di <head>. */
  const collectAudioMeta = (doc: Document, base: string): void => {
    doc
      .querySelectorAll('meta[property="og:audio"], meta[property="og:audio:url"], meta[name="twitter:player:stream"]')
      .forEach((node) => {
        add(node.getAttribute('content'), '', 'link', base);
      });
  };

  const visit = (doc: Document): void => {
    const base = baseOf(doc);
    collectAudioElements(doc, base);
    collectVideoElements(doc, base);
    collectAudioLinks(doc, base);
    collectAudioMeta(doc, base);
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

  return [...seen.values()].slice(0, 200);
}

/**
 * Dipindai di MAIN world (konteks JS halaman) via `executeScript({ world: 'MAIN' })`.
 * WAJIB self-contained seperti `scanPageAudio`.
 *
 * Menutup celah yang tak terlihat oleh pemindaian DOM: audio yang diputar
 * lewat Web Audio API (howler.js, AudioContext/decodeAudioData) atau lewat
 * `new Audio()` yang tidak pernah ditempel ke DOM.
 *
 * Cara kerja (semuanya idempoten, hasil diakumulasi di `globalThis`):
 * 1. Resource Timing API — menangkap file audio yang sudah dimuat halaman
 *    SEBELUM popup dibuka (mis. howler yang preload saat load).
 * 2. Hook `fetch`, `XMLHttpRequest.open`, dan setter `HTMLMediaElement.src`
 *    — menangkap audio yang dimuat setelahnya.
 */
export function scanAudioNetwork(): ScannedAudio[] {
  const AUDIO_EXTS = ['mp3', 'wav', 'ogg', 'oga', 'm4a', 'aac', 'flac', 'opus', 'weba', 'mid', 'midi'];

  const scope = globalThis as typeof globalThis & {
    __assetAudioSeen?: Set<string>;
    __assetAudioHooked?: boolean;
  };
  const seen: Set<string> = scope.__assetAudioSeen ?? (scope.__assetAudioSeen = new Set<string>());

  const toAbs = (raw: string): string | null => {
    try {
      const u = new URL(raw, location.href);
      return u.protocol === 'http:' || u.protocol === 'https:' ? u.href : null;
    } catch {
      return null;
    }
  };

  const extOf = (url: string): string => {
    try {
      const path = new URL(url).pathname.split('/').pop() ?? '';
      const ext = (path.split('.').pop() ?? '').toLowerCase();
      return AUDIO_EXTS.includes(ext) ? ext : '';
    } catch {
      return '';
    }
  };

  const record = (raw: unknown): void => {
    if (typeof raw !== 'string') return;
    const url = toAbs(raw);
    if (url && extOf(url)) seen.add(url);
  };

  if (!scope.__assetAudioHooked) {
    scope.__assetAudioHooked = true;

    const originalFetch = globalThis.fetch;
    if (typeof originalFetch === 'function') {
      globalThis.fetch = function (input: RequestInfo | URL, init?: RequestInit) {
        try {
          record(typeof input === 'string' ? input : input instanceof URL ? input.href : input.url);
        } catch {
          /* biarkan permintaan tetap jalan */
        }
        return originalFetch.call(globalThis, input, init);
      };
    }

    const originalOpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function (
      this: XMLHttpRequest,
      method: string,
      url: string | URL,
      async: boolean = true,
      username?: string | null,
      password?: string | null,
    ): void {
      try {
        record(url);
      } catch {
        /* biarkan permintaan tetap jalan */
      }
      originalOpen.call(this, method, url, async, username, password);
    };

    const originalSrc = Object.getOwnPropertyDescriptor(HTMLMediaElement.prototype, 'src');
    if (originalSrc?.get && originalSrc.set) {
      const setSrc = originalSrc.set;
      Object.defineProperty(HTMLMediaElement.prototype, 'src', {
        configurable: true,
        enumerable: originalSrc.enumerable,
        get: originalSrc.get,
        set(this: HTMLMediaElement, value: string) {
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

  try {
    performance.getEntriesByType('resource').forEach((entry) => record(entry.name));
  } catch {
    /* Resource Timing tak tersedia: cukup andalkan hook */
  }

  return [...seen].map((url) => ({ url, title: '', ext: extOf(url), kind: 'network', playable: true }));
}
