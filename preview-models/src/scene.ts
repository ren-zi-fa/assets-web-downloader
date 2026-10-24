/**
 * Shared types + helpers for the 3D model preview app.
 *
 * A "scene" can be one of:
 * - `.splinecode` — rendered with the Spline runtime.
 * - `.glb` / `.gltf` — rendered with <model-viewer>.
 * - anything else — currently unsupported for rendering.
 */

export type SceneFormat = 'spline' | 'glb' | 'gltf' | 'other'

export type SceneSource =
  | { kind: 'url'; url: string; name: string; size: number; format: SceneFormat }
  | { kind: 'buffer'; buffer: ArrayBuffer; name: string; size: number; format: SceneFormat }

export interface SceneMeta {
  name: string
  /** Byte size of the source file; 0 means "unknown" (e.g. a remote URL). */
  size: number
  /** Number of objects in the scene, reported by the Spline runtime only. */
  objects?: number
}

export type SceneStatus =
  | { state: 'idle' }
  | { state: 'loading' }
  | { state: 'ready'; meta: SceneMeta }
  | { state: 'error'; message: string }

export const UNSUPPORTED_MESSAGE =
  'Unsupported file. Expected a .splinecode, .glb, or .gltf model.'

const FORMAT_BY_EXTENSION: Record<string, SceneFormat> = {
  splinecode: 'spline',
  glb: 'glb',
  gltf: 'gltf',
}

const MIME_BY_FORMAT: Partial<Record<SceneFormat, string>> = {
  glb: 'model/gltf-binary',
  gltf: 'model/gltf+json',
}

/** File extension (lowercase, without the dot) from a URL or file name. */
function extOf(nameOrUrl: string): string {
  let path = nameOrUrl
  try {
    path = new URL(nameOrUrl).pathname
  } catch {
    // Not a URL; treat the value as a plain file name.
  }
  const base = path.split('/').pop() ?? path
  const dot = base.lastIndexOf('.')
  return dot < 0 ? '' : base.slice(dot + 1).toLowerCase()
}

/** Map a URL / file name to a renderer-supported format. */
export function formatOf(nameOrUrl: string): SceneFormat {
  return FORMAT_BY_EXTENSION[extOf(nameOrUrl)] ?? 'other'
}

/** Human-readable file name extracted from a URL. */
export function fileNameFromUrl(url: string): string {
  try {
    const path = new URL(url).pathname
    return path.split('/').pop() || 'model'
  } catch {
    return url
  }
}

/** MIME type used to wrap a local buffer in a Blob. */
export function mimeOf(format: SceneFormat): string {
  return MIME_BY_FORMAT[format] ?? 'application/octet-stream'
}

/**
 * Read a model from the query string (`?url=…`) when opened via an extension.
 * Returns the initial source + status for bootstrapping the app.
 */
export function parseUrlModel(search: string): {
  source: SceneSource | null
  status: SceneStatus
} {
  const params = new URLSearchParams(search)
  const url = params.get('url')
  if (!url) return { source: null, status: { state: 'idle' } }

  const format = formatOf(url)
  if (format === 'other') {
    return { source: null, status: { state: 'error', message: UNSUPPORTED_MESSAGE } }
  }

  return {
    source: { kind: 'url', url, name: params.get('name') ?? fileNameFromUrl(url), size: 0, format },
    status: { state: 'loading' },
  }
}
