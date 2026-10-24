/**
 * Konversi GLB ↔ glTF + pengambilan byte model lintas-origin.
 *
 * Berjalan di sisi popup (extension page), BUKAN di tab target, jadi bebas
 * memakai `browser`, `TextEncoder`, dsb. Pengambilan byte lintas-origin
 * dilakukan lewat background service worker (lihat entrypoints/background.ts)
 * yang punya `host_permissions`, sehingga lolos CORS.
 */

const GLB_MAGIC = 0x46546c67; // 'glTF'
const CHUNK_JSON = 0x4e4f534a; // 'JSON'
const CHUNK_BIN = 0x004e4942; // 'BIN\0'

/** Format yang bisa dikonversi/export. Selain ini hanya bisa diunduh mentah. */
export const CONVERTIBLE_FORMATS = new Set(['glb', 'gltf']);

// ---- helper byte ----

export function bytesToBase64(bytes: Uint8Array): string {
  let binary = '';
  const CHUNK = 0x8000;
  for (let i = 0; i < bytes.length; i += CHUNK) {
    binary += String.fromCharCode(...bytes.subarray(i, i + CHUNK));
  }
  return btoa(binary);
}

function base64ToBytes(b64: string): Uint8Array<ArrayBuffer> {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

function utf8Encode(text: string): Uint8Array<ArrayBuffer> {
  return new TextEncoder().encode(text);
}

function utf8Decode(bytes: Uint8Array): string {
  return new TextDecoder().decode(bytes);
}

function bytesToDataUrl(bytes: Uint8Array, mime: string): string {
  return `data:${mime};base64,${bytesToBase64(bytes)}`;
}

function dataUriToBytes(uri: string): Uint8Array<ArrayBuffer> {
  const comma = uri.indexOf(',');
  if (comma < 0) throw new Error('Invalid data URI.');
  const meta = uri.slice(0, comma);
  const payload = uri.slice(comma + 1);
  if (meta.includes(';base64')) return base64ToBytes(payload);
  return utf8Encode(decodeURIComponent(payload));
}

const MIME_BY_EXT: Record<string, string> = {
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  webp: 'image/webp',
  ktx2: 'image/ktx2',
};

function guessMime(uri: string): string {
  const path = (uri.split(/[?#]/)[0] ?? '').split('/').pop() ?? '';
  const dot = path.lastIndexOf('.');
  const ext = dot < 0 ? '' : path.slice(dot + 1).toLowerCase();
  return MIME_BY_EXT[ext] ?? 'application/octet-stream';
}

// ---- pengambilan byte via background ----

interface FetchModelResponse {
  ok: boolean;
  base64?: string;
  error?: string;
}

export async function fetchModelBytes(url: string): Promise<Uint8Array<ArrayBuffer>> {
  const res = (await browser.runtime.sendMessage({
    type: 'fetchModel',
    url,
  })) as FetchModelResponse;
  if (!res || !res.ok || !res.base64) {
    throw new Error(res?.error || 'Failed to download the model.');
  }
  return base64ToBytes(res.base64);
}

// ---- GLB -> glTF (self-contained) ----

/** Bongkar GLB menjadi JSON glTF dengan BIN chunk di-inline sebagai data URI. */
function glbToGltfJson(bytes: Uint8Array): Record<string, unknown> {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  if (bytes.length < 12 || view.getUint32(0, true) !== GLB_MAGIC) {
    throw new Error('Not a valid GLB file.');
  }

  let offset = 12;
  let json: Record<string, unknown> | null = null;
  let bin: Uint8Array | null = null;
  while (offset + 8 <= bytes.length) {
    const chunkLength = view.getUint32(offset, true);
    const chunkType = view.getUint32(offset + 4, true);
    const data = bytes.subarray(offset + 8, offset + 8 + chunkLength);
    if (chunkType === CHUNK_JSON) {
      json = JSON.parse(utf8Decode(data).trim()) as Record<string, unknown>;
    } else if (chunkType === CHUNK_BIN) {
      bin = data;
    }
    offset += 8 + chunkLength;
  }

  if (!json) throw new Error('GLB has no JSON chunk.');

  const buffers = json.buffers as Array<Record<string, unknown>> | undefined;
  if (bin && Array.isArray(buffers) && buffers[0]) {
    buffers[0].uri = bytesToDataUrl(bin, 'application/octet-stream');
    delete buffers[0].byteLength;
  }
  return json;
}

// ---- glTF -> GLB ----

/** Bangun GLB (JSON chunk + BIN chunk) dari glTF JSON dan buffer biner. */
function buildGlb(json: unknown, bin: Uint8Array): Uint8Array<ArrayBuffer> {
  const jsonBytes = utf8Encode(JSON.stringify(json));
  const jsonLen = Math.ceil(jsonBytes.length / 4) * 4;
  const jsonPadded = new Uint8Array(jsonLen);
  jsonPadded.fill(0x20);
  jsonPadded.set(jsonBytes);

  const binLen = bin.length ? Math.ceil(bin.length / 4) * 4 : 0;
  const binPadded = new Uint8Array(binLen);
  binPadded.set(bin);

  const total = 12 + 8 + jsonLen + (binLen ? 8 + binLen : 0);
  const out = new Uint8Array(total);
  const view = new DataView(out.buffer);
  let off = 0;
  view.setUint32(off, GLB_MAGIC, true);
  off += 4;
  view.setUint32(off, 2, true); // versi 2
  off += 4;
  view.setUint32(off, total, true);
  off += 4;
  view.setUint32(off, jsonLen, true);
  off += 4;
  view.setUint32(off, CHUNK_JSON, true);
  off += 4;
  out.set(jsonPadded, off);
  off += jsonLen;
  if (binLen) {
    view.setUint32(off, binLen, true);
    off += 4;
    view.setUint32(off, CHUNK_BIN, true);
    off += 4;
    out.set(binPadded, off);
    off += binLen;
  }
  return out;
}

/** Ambil byte dari `uri` (data URI atau URL, relatif terhadap baseUrl). */
async function resolveUri(uri: string, baseUrl: string): Promise<Uint8Array<ArrayBuffer>> {
  if (uri.startsWith('data:')) return dataUriToBytes(uri);
  return fetchModelBytes(new URL(uri, baseUrl).href);
}

/** Ubah glTF JSON (dengan resource eksternal) menjadi GLB tunggal. */
async function gltfToGlb(
  json: Record<string, unknown>,
  baseUrl: string,
): Promise<Uint8Array<ArrayBuffer>> {
  const buffers = Array.isArray(json.buffers)
    ? (json.buffers as Array<Record<string, unknown>>)
    : [];

  // 1) Ambil byte tiap buffer.
  const bufferBytes: Uint8Array<ArrayBuffer>[] = [];
  for (const buf of buffers) {
    if (typeof buf.uri === 'string') {
      bufferBytes.push(await resolveUri(buf.uri, baseUrl));
      delete buf.uri;
    } else {
      bufferBytes.push(new Uint8Array(0));
    }
  }

  // 2) Inline gambar eksternal agar GLB self-contained.
  if (Array.isArray(json.images)) {
    for (const img of json.images as Array<Record<string, unknown>>) {
      if (typeof img.uri === 'string' && !img.uri.startsWith('data:')) {
        img.uri = bytesToDataUrl(await resolveUri(img.uri, baseUrl), guessMime(img.uri));
      }
    }
  }

  // 3) Gabung buffer (rata 4 byte) dan remap bufferViews ke buffer 0.
  let bin: Uint8Array<ArrayBuffer>;
  if (buffers.length > 1) {
    const offsets: number[] = [];
    let acc = 0;
    for (let i = 0; i < buffers.length; i++) {
      offsets[i] = acc;
      acc += Math.ceil(bufferBytes[i]!.length / 4) * 4;
    }
    const merged = new Uint8Array(acc);
    for (let i = 0; i < buffers.length; i++) merged.set(bufferBytes[i]!, offsets[i]!);
    bin = merged;
    if (Array.isArray(json.bufferViews)) {
      for (const bv of json.bufferViews as Array<Record<string, unknown>>) {
        const bi = typeof bv.buffer === 'number' ? bv.buffer : 0;
        bv.buffer = 0;
        bv.byteOffset = ((bv.byteOffset as number) || 0) + offsets[bi]!;
      }
    }
  } else {
    bin = bufferBytes[0] ?? new Uint8Array(0);
  }

  json.buffers = buffers.length ? [{ byteLength: bin.length }] : [];

  return buildGlb(json, bin);
}

// ---- API publik untuk panel ----

export interface ConvertedFile {
  dataUrl: string;
  ext: string;
}

/** Konversi model ke format sebaliknya (glb <-> gltf). */
export async function convertModel(url: string, format: string): Promise<ConvertedFile> {
  if (format === 'glb') {
    const bytes = await fetchModelBytes(url);
    const json = glbToGltfJson(bytes);
    const dataUrl = bytesToDataUrl(utf8Encode(JSON.stringify(json)), 'model/gltf+json');
    return { dataUrl, ext: 'gltf' };
  }
  if (format === 'gltf') {
    const bytes = await fetchModelBytes(url);
    const json = JSON.parse(utf8Decode(bytes)) as Record<string, unknown>;
    const glb = await gltfToGlb(json, url);
    return { dataUrl: bytesToDataUrl(glb, 'model/gltf-binary'), ext: 'glb' };
  }
  throw new Error(`Conversion is not supported for .${format}.`);
}
