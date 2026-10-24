import { describe, expect, it } from 'vitest';
import { exportSceneToGlb } from './exportScene';

const IDENTITY = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];

/** Scene tiruan dengan satu mesh segitiga (posisi + normal + uv + index). */
function makeScene() {
  const geometry = {
    attributes: {
      position: { array: new Float32Array([0, 0, 0, 1, 0, 0, 0, 1, 0]), itemSize: 3, count: 3 },
      normal: { array: new Float32Array([0, 0, 1, 0, 0, 1, 0, 0, 1]), itemSize: 3, count: 3 },
      uv: { array: new Float32Array([0, 0, 1, 0, 0, 1]), itemSize: 2, count: 3 },
    },
    index: { array: new Uint16Array([0, 1, 2]), count: 3 },
  };
  const material = { name: 'Red', color: { r: 1, g: 0, b: 0 }, metalness: 0, roughness: 1 };
  const mesh = {
    name: 'Triangle',
    isMesh: true,
    geometry,
    material,
    matrixWorld: { elements: IDENTITY },
    children: [],
  };
  return { name: 'Root', updateMatrixWorld: () => {}, children: [mesh] };
}

/** Bongkar GLB base64 menjadi JSON glTF + buffer BIN. */
function decodeGlb(base64: string): { json: Record<string, unknown>; bin: Uint8Array } {
  const bytes = Uint8Array.from(Buffer.from(base64, 'base64'));
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  expect(view.getUint32(0, true)).toBe(0x46546c67); // 'glTF'
  expect(view.getUint32(4, true)).toBe(2);

  let offset = 12;
  let json: Record<string, unknown> | null = null;
  let bin = new Uint8Array(0);
  while (offset + 8 <= bytes.length) {
    const chunkLength = view.getUint32(offset, true);
    const chunkType = view.getUint32(offset + 4, true);
    const data = bytes.subarray(offset + 8, offset + 8 + chunkLength);
    if (chunkType === 0x4e4f534a) {
      json = JSON.parse(new TextDecoder().decode(data).trim()) as Record<string, unknown>;
    } else if (chunkType === 0x004e4942) {
      bin = data;
    }
    offset += 8 + chunkLength;
  }
  if (!json) throw new Error('GLB has no JSON chunk');
  return { json, bin };
}

describe('exportSceneToGlb', () => {
  it('mengekspor scene three.js menjadi GLB valid', () => {
    (globalThis as Record<string, unknown>).__assetScenes = [{ scene: makeScene() }];

    const result = exportSceneToGlb(0);

    expect(result.ok).toBe(true);
    expect(result.name).toBe('Root');
    expect(result.base64).toBeTruthy();

    const { json, bin } = decodeGlb(result.base64!);

    expect(json.asset).toMatchObject({ version: '2.0' });
    expect((json.meshes as unknown[]).length).toBe(1);
    expect((json.nodes as unknown[]).length).toBe(1);

    // POSITION accessor (VEC3, 3 vertex) + NORMAL + TEXCOORD_0 + indices.
    const accessors = json.accessors as Array<Record<string, unknown>>;
    const position = accessors.find((a) => a.type === 'VEC3' && Array.isArray(a.min));
    expect(position).toBeTruthy();
    expect(position!.count).toBe(3);
    expect(position!.componentType).toBe(5126);
    // min/max dari segitiga: min (0,0,0), max (1,1,0).
    expect(position!.min).toEqual([0, 0, 0]);
    expect(position!.max).toEqual([1, 1, 0]);

    const indices = accessors.find((a) => a.type === 'SCALAR');
    expect(indices!.count).toBe(3);

    // Material base color merah.
    const materials = json.materials as Array<Record<string, unknown>>;
    expect(materials[0]!.name).toBe('Red');
    expect((materials[0]!.pbrMetallicRoughness as Record<string, unknown>).baseColorFactor).toEqual(
      [1, 0, 0, 1],
    );

    expect(bin.byteLength).toBeGreaterThan(0);
  });

  it('mengembalikan error saat scene tidak ditemukan', () => {
    (globalThis as Record<string, unknown>).__assetScenes = [];
    const result = exportSceneToGlb(0);
    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/not found/i);
  });
});
