import { beforeEach, describe, expect, it } from 'vitest';
import { scanWebGlScenes } from './scanner';

interface MockRenderer {
  prototype: { render: (scene: unknown, camera: unknown) => void };
}

function makeRendererNamespace(): { WebGLRenderer: MockRenderer } {
  function WebGLRenderer() {
    /* mock */
  }
  WebGLRenderer.prototype.render = function (_scene: unknown, _camera: unknown) {
    /* mock */
  };
  return { WebGLRenderer: WebGLRenderer as unknown as MockRenderer };
}

describe('scanWebGlScenes', () => {
  beforeEach(() => {
    const g = globalThis as Record<string, unknown>;
    delete g.__assetScenes;
    delete g.__assetWebGlHooked;
    delete g.RK;
    delete g.THREE;
  });

  it('mendeteksi renderer three.js di namespace non-THREE (mis. RK)', () => {
    const g = globalThis as Record<string, unknown>;
    g.RK = makeRendererNamespace();

    // Analisis pertama memasang hook; scene belum dirender → kosong.
    expect(scanWebGlScenes().items.length).toBe(0);

    // Render scene → hook mencatatnya.
    const renderer = { domElement: { width: 800, height: 600 } };
    const scene = { name: 'Hero', children: [], updateMatrixWorld() {} };
    const RK = g.RK as {
      WebGLRenderer: { prototype: { render: (s: unknown, c: unknown) => void } };
    };
    RK.WebGLRenderer.prototype.render.call(renderer, scene, {});

    const second = scanWebGlScenes();
    expect(second.total).toBe(1);
    expect(second.items[0]).toMatchObject({
      index: 0,
      objects: 1,
      width: 800,
      height: 600,
      renderer: 'webgl',
    });
  });

  it('tidak crash saat window.THREE tidak ada', () => {
    expect(scanWebGlScenes().items.length).toBe(0);
  });
});
