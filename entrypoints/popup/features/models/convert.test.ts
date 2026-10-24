import { afterEach, describe, expect, it, vi } from 'vitest';
import { bytesToBase64, convertModel } from './convert';

// convert.ts memakai `browser.runtime.sendMessage` (global dari WXT). Di node
// tidak ada browser, jadi kita stub manual.
const sendMessage = vi.fn();
vi.stubGlobal('browser', { runtime: { sendMessage } });

const GLB_MAGIC = 0x46546c67; // 'glTF'
const CHUNK_JSON = 0x4e4f534a; // 'JSON'
const CHUNK_BIN = 0x004e4942; // 'BIN\0'

/** Bangun GLB minimal untuk pengujian (JSON + BIN, rata 4 byte). */
function buildGlb(jsonText: string, bin: number[]): Uint8Array {
  const jsonBytes = new TextEncoder().encode(jsonText);
  const jsonLen = Math.ceil(jsonBytes.length / 4) * 4;
  const jsonPadded = new Uint8Array(jsonLen);
  jsonPadded.fill(0x20);
  jsonPadded.set(jsonBytes);

  const binBytes = new Uint8Array(bin);
  const binLen = Math.ceil(binBytes.length / 4) * 4;
  const binPadded = new Uint8Array(binLen);
  binPadded.set(binBytes);

  const total = 12 + 8 + jsonLen + 8 + binLen;
  const out = new Uint8Array(total);
  const view = new DataView(out.buffer);
  let off = 0;
  view.setUint32(off, GLB_MAGIC, true);
  off += 4;
  view.setUint32(off, 2, true);
  off += 4;
  view.setUint32(off, total, true);
  off += 4;
  view.setUint32(off, jsonLen, true);
  off += 4;
  view.setUint32(off, CHUNK_JSON, true);
  off += 4;
  out.set(jsonPadded, off);
  off += jsonLen;
  view.setUint32(off, binLen, true);
  off += 4;
  view.setUint32(off, CHUNK_BIN, true);
  off += 4;
  out.set(binPadded, off);
  return out;
}

const toBase64 = (bytes: Uint8Array): string => Buffer.from(bytes).toString('base64');

/** Baca isi BIN chunk dari GLB (untuk cek round-trip). */
function readGlbBin(glb: Uint8Array): number[] {
  const view = new DataView(glb.buffer, glb.byteOffset, glb.byteLength);
  let offset = 12;
  while (offset + 8 <= glb.length) {
    const len = view.getUint32(offset, true);
    const type = view.getUint32(offset + 4, true);
    if (type === CHUNK_BIN) return Array.from(glb.subarray(offset + 8, offset + 8 + len));
    offset += 8 + len;
  }
  return [];
}

afterEach(() => sendMessage.mockReset());

describe('bytesToBase64', () => {
  it('mengencode byte menjadi base64', () => {
    expect(bytesToBase64(new Uint8Array([0, 1, 2, 3]))).toBe('AAECAw==');
  });
});

describe('convertModel', () => {
  it('mengubah GLB menjadi glTF self-contained', async () => {
    const glb = buildGlb('{"asset":{"version":"2.0"},"buffers":[{"byteLength":4}]}', [0, 1, 2, 3]);
    sendMessage.mockResolvedValue({ ok: true, base64: toBase64(glb) });

    const result = await convertModel('https://example.test/model.glb', 'glb');

    expect(result.ext).toBe('gltf');
    expect(result.dataUrl.startsWith('data:model/gltf+json;base64,')).toBe(true);

    const jsonText = Buffer.from(result.dataUrl.split(',')[1]!, 'base64').toString('utf8');
    const json = JSON.parse(jsonText) as { buffers: Array<{ uri?: string }> };
    expect(json.buffers[0]?.uri).toBe('data:application/octet-stream;base64,AAECAw==');
  });

  it('round-trip glb -> gltf -> glb tanpa kehilangan buffer', async () => {
    const source =
      '{"asset":{"version":"2.0"},"buffers":[{"byteLength":4}],"bufferViews":[{"buffer":0,"byteOffset":0,"byteLength":4}],"accessors":[{"bufferView":0,"componentType":5126,"count":1,"type":"SCALAR"}]}';
    const glb = buildGlb(source, [0, 1, 2, 3]);

    // glb -> gltf
    sendMessage.mockResolvedValue({ ok: true, base64: toBase64(glb) });
    const asGltf = await convertModel('https://example.test/model.glb', 'glb');

    // gltf -> glb (glTF sudah self-contained, tidak perlu fetch tambahan)
    sendMessage.mockResolvedValue({ ok: true, base64: asGltf.dataUrl.split(',')[1]! });
    const asGlb = await convertModel('https://example.test/model.gltf', 'gltf');

    expect(asGlb.ext).toBe('glb');
    expect(asGlb.dataUrl.startsWith('data:model/gltf-binary;base64,')).toBe(true);

    const glbAgain = Uint8Array.from(Buffer.from(asGlb.dataUrl.split(',')[1]!, 'base64'));
    expect(readGlbBin(glbAgain).slice(0, 4)).toEqual([0, 1, 2, 3]);
  });

  it('menolak format yang tak didukung', async () => {
    await expect(convertModel('https://example.test/robot.splinecode', 'splinecode')).rejects.toThrow(
      /not supported/i,
    );
  });

  it('meneruskan error dari background', async () => {
    sendMessage.mockResolvedValue({ ok: false, error: 'HTTP 403' });
    await expect(convertModel('https://example.test/model.glb', 'glb')).rejects.toThrow('HTTP 403');
  });
});
