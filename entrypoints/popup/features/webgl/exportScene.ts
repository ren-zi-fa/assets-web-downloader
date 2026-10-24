/**
 * Export scene three.js menjadi GLB (glTF 2.0 binary).
 *
 * Berjalan di MAIN world (dipanggil lewat `browser.scripting.executeScript`
 * dengan `world: 'MAIN'`), jadi WAJIB self-contained seperti pemindai lain:
 * semua helper didefinisikan BERSARANG di dalam fungsi karena hanya source
 * fungsi ini yang diserialisasi ke tab target.
 *
 * Serialisasi dilakukan dengan "duck typing" pada objek three.js (membaca
 * properti standar `children`, `matrixWorld`, `geometry`, `material`, dll.),
 * BUKAN meng-import three.js, supaya tetap bekerja meski halaman mem-bundle
 * versi three.js yang berbeda. Transform world di-bake ke tiap vertex sehingga
 * hierarki tidak perlu direkonstruksi.
 *
 * Batasan v1:
 * - hanya geometri (POSITION/NORMAL/TEXCOORD_0) + material PBR dasar;
 *   tekstur tidak di-embed, skinning/morph tidak diekspor;
 * - hasil adalah snapshot scene saat ini (transform terkini), bukan file asli.
 */
export function exportSceneToGlb(index: number): {
  ok: boolean;
  base64?: string;
  name?: string;
  error?: string;
} {
  const scope = globalThis as typeof globalThis & { __assetScenes?: Array<{ scene: unknown }> };
  const entry = scope.__assetScenes?.[index];
  const scene = entry?.scene;
  if (!scene) {
    return { ok: false, error: 'Scene not found. Click Analyze again, then retry.' };
  }

  // Tipe "duck" untuk objek three.js yang kita baca.
  type AttributeLike = { array: ArrayLike<number>; itemSize: number; count: number };
  type GeometryLike = {
    attributes?: Record<string, AttributeLike | undefined>;
    index?: AttributeLike | null;
  };
  type MaterialLike = {
    name?: string;
    type?: string;
    color?: { r: number; g: number; b: number };
    opacity?: number;
    metalness?: number;
    roughness?: number;
    side?: number;
    transparent?: boolean;
  };
  type MeshLike = {
    name?: string;
    children?: unknown[];
    isMesh?: boolean;
    geometry?: GeometryLike;
    material?: MaterialLike | MaterialLike[];
    matrixWorld?: { elements?: ArrayLike<number> };
  };

  const sceneObj = scene as { updateMatrixWorld?: (force: boolean) => void; name?: string };
  if (typeof sceneObj.updateMatrixWorld === 'function') sceneObj.updateMatrixWorld(true);

  // ---- Kumpulkan semua mesh ----
  const meshes: MeshLike[] = [];
  const collect = (node: unknown): void => {
    if (!node) return;
    const obj = node as MeshLike;
    if (obj.isMesh && obj.geometry) meshes.push(obj);
    if (Array.isArray(obj.children)) for (const child of obj.children) collect(child);
  };
  collect(scene);

  if (meshes.length === 0) {
    return { ok: false, error: 'The scene contains no mesh geometry to export.' };
  }

  // ---- Konstanta glTF ----
  const FLOAT = 5126;
  const UNSIGNED_INT = 5125;

  // ---- Pembangun buffer biner tunggal (aksesor + bufferView) ----
  const bufferViews: Array<{ buffer: number; byteOffset: number; byteLength: number }> = [];
  const accessors: Array<Record<string, unknown>> = [];
  const chunks: Uint8Array[] = [];
  let offset = 0;

  const align4 = (): void => {
    const pad = (4 - (offset % 4)) % 4;
    if (pad) {
      chunks.push(new Uint8Array(pad));
      offset += pad;
    }
  };

  const pushView = (
    typedArray: Float32Array | Uint32Array,
    componentType: number,
    type: string,
    minMax?: number[],
  ): number => {
    align4();
    const bytes = new Uint8Array(typedArray.buffer, typedArray.byteOffset, typedArray.byteLength);
    chunks.push(bytes);
    bufferViews.push({ buffer: 0, byteOffset: offset, byteLength: bytes.byteLength });
    offset += bytes.byteLength;

    const size = type === 'SCALAR' ? 1 : type === 'VEC2' ? 2 : type === 'VEC3' ? 3 : 4;
    const accessor: Record<string, unknown> = {
      bufferView: bufferViews.length - 1,
      componentType,
      count: typedArray.length / size,
      type,
    };
    if (minMax) {
      accessor.min = minMax.slice(0, 3);
      accessor.max = minMax.slice(3);
    }
    accessors.push(accessor);
    return accessors.length - 1;
  };

  // ---- Material ----
  const materialIndexByRef = new Map<unknown, number>();
  const gltfMaterials: Array<Record<string, unknown>> = [];

  const materialIndex = (material: MaterialLike | undefined): number | undefined => {
    if (!material) return undefined;
    const cached = materialIndexByRef.get(material);
    if (cached !== undefined) return cached;

    const baseColor = [1, 1, 1, 1];
    if (material.color) {
      baseColor[0] = material.color.r;
      baseColor[1] = material.color.g;
      baseColor[2] = material.color.b;
    }
    if (typeof material.opacity === 'number') baseColor[3] = material.opacity;

    const mat: Record<string, unknown> = {
      name: material.name || material.type || 'Material',
      pbrMetallicRoughness: {
        baseColorFactor: baseColor,
        metallicFactor: typeof material.metalness === 'number' ? material.metalness : 0,
        roughnessFactor: typeof material.roughness === 'number' ? material.roughness : 1,
      },
    };
    if (material.side === 2) mat.doubleSided = true;
    if (material.transparent || (typeof material.opacity === 'number' && material.opacity < 1)) {
      mat.alphaMode = 'BLEND';
    }

    const idx = gltfMaterials.length;
    gltfMaterials.push(mat);
    materialIndexByRef.set(material, idx);
    return idx;
  };

  // ---- Bangun geometri tiap mesh ----
  const gltfNodes: Array<Record<string, unknown>> = [];
  const gltfMeshes: Array<Record<string, unknown>> = [];

  for (const mesh of meshes) {
    const geom = mesh.geometry;
    if (!geom) continue;
    const posAttr = geom.attributes?.position;
    if (!posAttr || posAttr.itemSize < 3 || posAttr.count <= 0) continue;

    const e: ArrayLike<number> = mesh.matrixWorld?.elements ?? [];
    const count = posAttr.count;
    const posArray = posAttr.array;
    const posStride = posAttr.itemSize;

    const positions = new Float32Array(count * 3);
    let minX = Infinity;
    let minY = Infinity;
    let minZ = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    let maxZ = -Infinity;

    for (let i = 0; i < count; i++) {
      const x = posArray[i * posStride] ?? 0;
      const y = posArray[i * posStride + 1] ?? 0;
      const z = posArray[i * posStride + 2] ?? 0;
      const px = (e[0] ?? 1) * x + (e[4] ?? 0) * y + (e[8] ?? 0) * z + (e[12] ?? 0);
      const py = (e[1] ?? 0) * x + (e[5] ?? 1) * y + (e[9] ?? 0) * z + (e[13] ?? 0);
      const pz = (e[2] ?? 0) * x + (e[6] ?? 0) * y + (e[10] ?? 1) * z + (e[14] ?? 0);
      positions[i * 3] = px;
      positions[i * 3 + 1] = py;
      positions[i * 3 + 2] = pz;
      if (px < minX) minX = px;
      if (px > maxX) maxX = px;
      if (py < minY) minY = py;
      if (py > maxY) maxY = py;
      if (pz < minZ) minZ = pz;
      if (pz > maxZ) maxZ = pz;
    }

    const attributes: Record<string, number> = {
      POSITION: pushView(positions, FLOAT, 'VEC3', [minX, minY, minZ, maxX, maxY, maxZ]),
    };

    const normalAttr = geom.attributes?.normal;
    if (normalAttr && normalAttr.itemSize >= 3 && normalAttr.count === count) {
      const normals = new Float32Array(count * 3);
      const nArray = normalAttr.array;
      const nStride = normalAttr.itemSize;
      for (let i = 0; i < count; i++) {
        const nx = nArray[i * nStride] ?? 0;
        const ny = nArray[i * nStride + 1] ?? 0;
        const nz = nArray[i * nStride + 2] ?? 0;
        let rx = (e[0] ?? 1) * nx + (e[4] ?? 0) * ny + (e[8] ?? 0) * nz;
        let ry = (e[1] ?? 0) * nx + (e[5] ?? 1) * ny + (e[9] ?? 0) * nz;
        let rz = (e[2] ?? 0) * nx + (e[6] ?? 0) * ny + (e[10] ?? 1) * nz;
        const len = Math.sqrt(rx * rx + ry * ry + rz * rz) || 1;
        normals[i * 3] = rx / len;
        normals[i * 3 + 1] = ry / len;
        normals[i * 3 + 2] = rz / len;
      }
      attributes.NORMAL = pushView(normals, FLOAT, 'VEC3');
    }

    const uvAttr = geom.attributes?.uv;
    if (uvAttr && uvAttr.itemSize >= 2 && uvAttr.count === count) {
      const uvs = new Float32Array(count * 2);
      const uvArray = uvAttr.array;
      const uvStride = uvAttr.itemSize;
      for (let i = 0; i < count; i++) {
        uvs[i * 2] = uvArray[i * uvStride] ?? 0;
        // glTF pakai UV origin kiri-atas; three.js kiri-bawah.
        uvs[i * 2 + 1] = 1 - (uvArray[i * uvStride + 1] ?? 0);
      }
      attributes.TEXCOORD_0 = pushView(uvs, FLOAT, 'VEC2');
    }

    let indexAccessor: number;
    const indexAttr = geom.index;
    if (indexAttr && indexAttr.count > 0) {
      const indices = new Uint32Array(indexAttr.count);
      for (let i = 0; i < indexAttr.count; i++) indices[i] = indexAttr.array[i] ?? 0;
      indexAccessor = pushView(indices, UNSIGNED_INT, 'SCALAR');
    } else {
      const indices = new Uint32Array(count);
      for (let i = 0; i < count; i++) indices[i] = i;
      indexAccessor = pushView(indices, UNSIGNED_INT, 'SCALAR');
    }

    const mat = Array.isArray(mesh.material) ? mesh.material[0] : mesh.material;
    const matIdx = materialIndex(mat as MaterialLike | undefined);

    const primitive: Record<string, unknown> = { attributes, indices: indexAccessor };
    if (matIdx !== undefined) primitive.material = matIdx;

    const meshIndex = gltfMeshes.length;
    gltfMeshes.push({
      name: mesh.name || `Mesh ${meshIndex}`,
      primitives: [primitive],
    });
    gltfNodes.push({ name: mesh.name || `Mesh ${meshIndex}`, mesh: meshIndex });
  }

  if (gltfMeshes.length === 0) {
    return { ok: false, error: 'The scene contains no exportable mesh geometry.' };
  }

  // ---- Susun JSON glTF + GLB ----
  const gltf = {
    asset: { version: '2.0', generator: 'Asset Downloader' },
    scene: 0,
    scenes: [{ nodes: gltfNodes.map((_, i) => i) }],
    nodes: gltfNodes,
    meshes: gltfMeshes,
    materials: gltfMaterials,
    accessors,
    bufferViews,
    buffers: [{ byteLength: offset }],
  };

  const bin = new Uint8Array(offset);
  let cursor = 0;
  for (const chunk of chunks) {
    bin.set(chunk, cursor);
    cursor += chunk.byteLength;
  }

  const glb = buildGlb(JSON.stringify(gltf), bin);
  const name = sanitize(sceneObj.name ?? '');
  return { ok: true, base64: bytesToBase64(glb), name };

  // ---- helper (nested supaya ikut terserialisasi) ----

  function utf8Encode(text: string): Uint8Array {
    return new TextEncoder().encode(text);
  }

  function bytesToBase64(bytes: Uint8Array): string {
    let binary = '';
    const CHUNK = 0x8000;
    for (let i = 0; i < bytes.length; i += CHUNK) {
      binary += String.fromCharCode(...bytes.subarray(i, i + CHUNK));
    }
    return btoa(binary);
  }

  function buildGlb(jsonText: string, binary: Uint8Array): Uint8Array {
    const GLB_MAGIC = 0x46546c67; // 'glTF'
    const CHUNK_JSON = 0x4e4f534a; // 'JSON'
    const CHUNK_BIN = 0x004e4942; // 'BIN\0'

    const jsonBytes = utf8Encode(jsonText);
    const jsonLen = Math.ceil(jsonBytes.length / 4) * 4;
    const jsonPadded = new Uint8Array(jsonLen);
    jsonPadded.fill(0x20);
    jsonPadded.set(jsonBytes);

    const binLen = binary.length ? Math.ceil(binary.length / 4) * 4 : 0;
    const binPadded = new Uint8Array(binLen);
    binPadded.set(binary);

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

  function sanitize(value: string): string {
    const clean = value
      .replace(/[^\w.-]+/g, '_')
      .replace(/^_+|_+$/g, '')
      .slice(0, 60);
    return clean || 'scene';
  }
}
