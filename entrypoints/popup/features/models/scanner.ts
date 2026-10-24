import type { ScanResult } from '../../shared/scan';

/** Satu aset model 3D yang ditemukan di halaman. */
export interface ScannedModel {
  url: string;
  /** Format tanpa titik, mis. 'glb', 'gltf', 'obj', 'splinecode'. */
  format: string;
  /** Sumber deteksi atau alasan tak bisa diunduh. */
  detail: string;
  downloadable: boolean;
}

/**
 * Pemindai DOM (ISOLATED world) untuk MODEL 3D.
 *
 * WAJIB self-contained seperti pemindai lain: helper dan konstanta
 * didefinisikan BERSARANG di dalam fungsi (hanya source fungsi ini yang
 * diserialisasi ke tab target — lihat catatan di images/scanner.ts).
 *
 * Sumber deteksi:
 * 1. Web component 3D: <model-viewer src>, <spline-viewer url>,
 *    <a-gltf-model src>/<a-entity gltf-model> (A-Frame).
 * 2. Elemen umum pembawa berkas: <a href>, <embed src>, <object data>.
 * 3. Resource Timing: URL berakhiran ekstensi model yang dimuat halaman
 *    (menangkap model yang di-fetch via JS tanpa pernah masuk DOM).
 *
 * Iframe same-origin ditelusuri rekursif; cross-origin dilewati aman.
 */
export function scanPageModels(): ScanResult<ScannedModel> {
  const MODEL_EXTS = [
    'glb',
    'gltf',
    'obj',
    'fbx',
    'usdz',
    'usd',
    'dae',
    'stl',
    'ply',
    '3mf',
    'vox',
    'splinecode',
  ];
  /** Batas hasil yang dikirim ke popup agar halaman tetap ringan. */
  const MAX_RESULTS = 200;

  const seen = new Map<string, ScannedModel>();

  const extOf = (url: string): string => {
    try {
      const path = new URL(url).pathname.split('/').pop() ?? '';
      const dot = path.lastIndexOf('.');
      return dot < 0 ? '' : path.slice(dot + 1).toLowerCase();
    } catch {
      return '';
    }
  };

  const toAbs = (raw: string, base: string): string | null => {
    try {
      const u = new URL(raw, base);
      if (u.protocol !== 'http:' && u.protocol !== 'https:') return null;
      return u.href;
    } catch {
      return null;
    }
  };

  const isModel = (url: string): boolean => MODEL_EXTS.includes(extOf(url));

  const add = (url: string, detail: string): void => {
    if (!url || seen.has(url)) return;
    seen.set(url, { url, format: extOf(url), detail, downloadable: true });
  };

  const addDom = (raw: string | null | undefined, detail: string): void => {
    if (!raw) return;
    const url = toAbs(raw.trim(), location.href);
    if (url && isModel(url)) add(url, detail);
  };

  const visit = (doc: Document): void => {
    // 1) Web component 3D (termasuk robot Spline di genesis.ceo).
    doc.querySelectorAll<HTMLElement>('model-viewer').forEach((el) => {
      addDom(el.getAttribute('src'), 'loaded by <model-viewer>');
    });
    doc.querySelectorAll<HTMLElement>('spline-viewer').forEach((el) => {
      addDom(el.getAttribute('url'), 'loaded by <spline-viewer>');
    });
    doc.querySelectorAll<HTMLElement>('a-gltf-model').forEach((el) => {
      addDom(el.getAttribute('src'), 'loaded by <a-gltf-model> (A-Frame)');
    });
    doc.querySelectorAll<HTMLElement>('a-entity[gltf-model]').forEach((el) => {
      addDom(el.getAttribute('gltf-model'), 'loaded by <a-entity gltf-model> (A-Frame)');
    });

    // 2) Elemen umum pembawa berkas 3D.
    doc.querySelectorAll<HTMLElement>('a[href]').forEach((el) => {
      addDom(el.getAttribute('href'), 'linked <a href>');
    });
    doc.querySelectorAll<HTMLElement>('embed[src]').forEach((el) => {
      addDom(el.getAttribute('src'), 'loaded by <embed>');
    });
    doc.querySelectorAll<HTMLElement>('object[data]').forEach((el) => {
      addDom(el.getAttribute('data'), 'loaded by <object>');
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

  // 3) Resource Timing — model yang di-fetch lewat JS.
  try {
    for (const entry of performance.getEntriesByType('resource') as PerformanceResourceTiming[]) {
      const url = toAbs(entry.name, location.href);
      if (url && isModel(url)) add(url, 'fetched by the page (JS/network)');
    }
  } catch {
    /* Resource Timing tak tersedia */
  }

  const all = [...seen.values()];
  return { items: all.slice(0, MAX_RESULTS), total: all.length };
}

/**
 * Pemindai MAIN world untuk MODEL: menutup celah yang tak terlihat DOM.
 *
 * Halaman sering memuat model lewat `fetch`/XHR atau menyetel `src`/`url`
 * pada <model-viewer>/<spline-viewer> dari JS. Hook di bawah mencatat URL
 * berakhiran ekstensi model, lalu diakumulasi di `globalThis` (idempoten)
 * supaya tiap Analyze cukup membaca riwayatnya. Semua hook dibungkus
 * try/catch agar tidak mengganggu halaman.
 */
export function scanModelSources(): ScanResult<ScannedModel> {
  const MODEL_EXTS = [
    'glb',
    'gltf',
    'obj',
    'fbx',
    'usdz',
    'usd',
    'dae',
    'stl',
    'ply',
    '3mf',
    'vox',
    'splinecode',
  ];

  const scope = globalThis as typeof globalThis & {
    __assetModelSeen?: Set<string>;
    __assetModelHooked?: boolean;
  };
  const seen: Set<string> = scope.__assetModelSeen ?? (scope.__assetModelSeen = new Set<string>());

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
      const dot = path.lastIndexOf('.');
      return dot < 0 ? '' : path.slice(dot + 1).toLowerCase();
    } catch {
      return '';
    }
  };

  const record = (raw: unknown): void => {
    if (typeof raw !== 'string' || raw.length === 0) return;
    const url = toAbs(raw);
    if (url && MODEL_EXTS.includes(extOf(url))) seen.add(url);
  };

  if (!scope.__assetModelHooked) {
    scope.__assetModelHooked = true;

    try {
      const originalFetch = globalThis.fetch;
      if (typeof originalFetch === 'function') {
        globalThis.fetch = function (input: RequestInfo | URL, init?: RequestInit) {
          try {
            record(
              typeof input === 'string' ? input : input instanceof URL ? input.href : input.url,
            );
          } catch {
            /* biarkan permintaan tetap jalan */
          }
          return originalFetch.call(globalThis, input, init);
        };
      }
    } catch {
      /* fetch tak bisa di-hook */
    }

    try {
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
    } catch {
      /* XHR tak bisa di-hook */
    }

    // Setter src pada <model-viewer> dan url pada <spline-viewer>.
    const hookProperty = (tag: string, prop: string): void => {
      try {
        const ctor = customElements.get(tag);
        const proto = (ctor?.prototype ?? {}) as Record<string, unknown>;
        const desc = Object.getOwnPropertyDescriptor(proto, prop);
        if (desc?.set) {
          const set = desc.set as (this: object, value: string) => void;
          Object.defineProperty(proto, prop, {
            configurable: true,
            enumerable: desc.enumerable,
            get: desc.get,
            set(this: object, value: string) {
              try {
                record(value);
              } catch {
                /* biarkan pemasangan tetap jalan */
              }
              set.call(this, value);
            },
          });
        }
      } catch {
        /* custom element belum terdaftar */
      }
    };
    hookProperty('model-viewer', 'src');
    hookProperty('spline-viewer', 'url');
  }

  const items: ScannedModel[] = [...seen].map((url) => ({
    url,
    format: (() => {
      try {
        const path = new URL(url).pathname.split('/').pop() ?? '';
        const dot = path.lastIndexOf('.');
        return dot < 0 ? '' : path.slice(dot + 1).toLowerCase();
      } catch {
        return '';
      }
    })(),
    detail: 'loaded from page JS',
    downloadable: true,
  }));
  return { items, total: items.length };
}
