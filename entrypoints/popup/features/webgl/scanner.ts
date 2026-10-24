import type { ScanResult } from '../../shared/scan';

/** Satu scene three.js yang terdeteksi di halaman (dari hook renderer). */
export interface ScannedScene {
  /** Indeks ke array scene di `globalThis.__assetScenes` (dipakai saat export). */
  index: number;
  /** Jumlah total node Object3D dalam scene (perkiraan kompleksitas). */
  objects: number;
  width: number;
  height: number;
  renderer: 'webgl' | 'webgpu';
  detail: string;
}

interface StoredScene {
  scene: unknown;
  canvas: { width?: number; height?: number } | null;
  renderer: 'webgl' | 'webgpu';
}

interface RendererCtor {
  prototype: { render?: (...args: unknown[]) => unknown };
}

type RendererNamespace = Record<'WebGLRenderer' | 'WebGPURenderer', RendererCtor | undefined>;

/**
 * Pemindai ISOLATED world untuk scene WebGL/three.js.
 *
 * WebGL/three.js tak bisa dijangkau dari ISOLATED world (JS halaman berjalan
 * di MAIN world), jadi deteksi sebenarnya dilakukan penuh di `scanWebGlScenes`
 * (dipasang sebagai `scanNetwork`). Fungsi ini hanya menyediakan hasil kosong
 * supaya `FeatureEntry.scan` tetap terpenuhi.
 */
export function scanWebGlPage(): ScanResult<ScannedScene> {
  return { items: [], total: 0 };
}

/**
 * Pemindai MAIN world untuk scene three.js (WebGL/WebGPU).
 *
 * three.js tidak menyimpan registry scene; scene hanya bisa dijangkau lewat
 * argumen `render(scene, camera)`. Hook di bawah mencatat tiap scene unik yang
 * di-render, menyimpannya di `globalThis.__assetScenes` (idempoten) supaya
 * fitur export bisa mengambilnya nanti.
 *
 * three.js sering di-bundle dengan namespace selain `THREE` — mis. Hero Forge
 * memakainya sebagai `window.RK`. Karena itu renderer dicari di SEMUA objek
 * global yang punya `WebGLRenderer`/`WebGPURenderer` dengan metode `render`,
 * bukan hanya `window.THREE`.
 *
 * Catatan: hook terpasang saat Analyze ditekan, jadi scene baru tercatat pada
 * render berikutnya — klik Analyze lagi bila hasil pertama masih kosong.
 */
export function scanWebGlScenes(): ScanResult<ScannedScene> {
  const scope = globalThis as typeof globalThis & {
    __assetScenes?: StoredScene[];
    __assetWebGlHooked?: boolean;
  };
  const scenes = scope.__assetScenes ?? (scope.__assetScenes = []);

  if (!scope.__assetWebGlHooked) {
    const namespaces = findRendererNamespaces(globalThis as Record<string, unknown>);
    if (namespaces.length > 0) scope.__assetWebGlHooked = true;

    for (const namespace of namespaces) {
      const rendererNames = ['WebGLRenderer', 'WebGPURenderer'] as const;
      for (const name of rendererNames) {
        const ctor = namespace[name];
        const proto = ctor?.prototype;
        const original = proto?.render;
        if (proto && typeof original === 'function') {
          proto.render = function (
            this: { domElement?: { width?: number; height?: number } },
            scene: unknown,
            camera: unknown,
          ) {
            try {
              if (scene && !scenes.some((entry) => entry.scene === scene)) {
                scenes.push({
                  scene,
                  canvas: this.domElement ?? null,
                  renderer: name === 'WebGPURenderer' ? 'webgpu' : 'webgl',
                });
              }
            } catch {
              /* biarkan render tetap jalan */
            }
            return original.call(this, scene, camera);
          };
        }
      }
    }
  }

  const countNodes = (node: unknown): number => {
    let count = 0;
    const stack = [node];
    while (stack.length) {
      const current = stack.pop();
      if (!current) continue;
      count += 1;
      const children = (current as { children?: unknown[] }).children;
      if (Array.isArray(children)) for (const child of children) stack.push(child);
    }
    return count;
  };

  const items: ScannedScene[] = scenes.map((entry, index) => {
    const objects = countNodes(entry.scene);
    return {
      index,
      objects,
      width: entry.canvas?.width ?? 0,
      height: entry.canvas?.height ?? 0,
      renderer: entry.renderer,
      detail: `three.js scene · ${objects} object${objects === 1 ? '' : 's'}`,
    };
  });

  return { items, total: items.length };
}

/**
 * Cari semua objek global yang membawa renderer three.js. Renderer dikenali
 * dari `WebGLRenderer`/`WebGPURenderer` (constructor dengan `.prototype.render`).
 */
function findRendererNamespaces(root: Record<string, unknown>): RendererNamespace[] {
  const isRendererCtor = (ctor: unknown): ctor is RendererCtor =>
    typeof ctor === 'function' && typeof (ctor as RendererCtor).prototype?.render === 'function';

  const namespaces: RendererNamespace[] = [];
  const seen = new Set<unknown>();

  let keys: string[] = [];
  try {
    keys = Object.keys(root);
  } catch {
    keys = [];
  }

  for (const key of keys) {
    let value: unknown;
    try {
      value = root[key];
    } catch {
      continue;
    }
    if (!value || seen.has(value)) continue;
    seen.add(value);
    if (typeof value !== 'object' && typeof value !== 'function') continue;

    const ns = value as Record<string, unknown>;
    const webgl = ns.WebGLRenderer;
    const webgpu = ns.WebGPURenderer;
    if (isRendererCtor(webgl) || isRendererCtor(webgpu)) {
      namespaces.push({
        WebGLRenderer: isRendererCtor(webgl) ? webgl : undefined,
        WebGPURenderer: isRendererCtor(webgpu) ? webgpu : undefined,
      });
    }
  }

  return namespaces;
}
