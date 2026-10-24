import '@google/model-viewer'
import { useEffect, useRef } from 'react'
import type { ModelViewerElement } from '@google/model-viewer'
import { mimeOf } from './scene'
import type { SceneSource, SceneStatus } from './scene'

interface ModelViewerCanvasProps {
  source: SceneSource | null
  /** Bump this to reload the current source without changing it. */
  reloadKey: number
  onStatusChange: (status: SceneStatus) => void
}

/**
 * Hosts a `<model-viewer>` element that renders `.glb` / `.gltf` models.
 *
 * The custom element is registered as a side effect of importing
 * `@google/model-viewer` above. Local file buffers are wrapped in a Blob URL;
 * remote URLs are passed straight through (subject to the host's CORS policy).
 */
export function ModelViewerCanvas({ source, reloadKey, onStatusChange }: ModelViewerCanvasProps) {
  const mountRef = useRef<HTMLDivElement>(null)
  const viewerRef = useRef<ModelViewerElement | null>(null)
  const objectUrlRef = useRef<string | null>(null)

  // One viewer for the lifetime of the container.
  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return
    const viewer = document.createElement('model-viewer') as ModelViewerElement
    viewer.setAttribute('camera-controls', '')
    viewer.setAttribute('auto-rotate', '')
    viewer.setAttribute('shadow-intensity', '1')
    viewer.classList.add('model-viewer-canvas')
    mount.appendChild(viewer)
    viewerRef.current = viewer
    return () => {
      viewer.remove()
      viewerRef.current = null
    }
  }, [])

  // (Re)load whenever the source or reload key changes.
  useEffect(() => {
    const viewer = viewerRef.current
    if (!viewer || !source) return

    let src: string
    if (source.kind === 'url') {
      src = source.url
    } else {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current)
      src = URL.createObjectURL(new Blob([source.buffer], { type: mimeOf(source.format) }))
      objectUrlRef.current = src
    }

    onStatusChange({ state: 'loading' })

    const onLoad = () => {
      onStatusChange({ state: 'ready', meta: { name: source.name, size: source.size } })
    }
    const onError = () => {
      onStatusChange({ state: 'error', message: 'Could not load the 3D model.' })
    }

    viewer.addEventListener('load', onLoad)
    viewer.addEventListener('error', onError)
    viewer.src = src
    viewer.alt = source.name

    return () => {
      viewer.removeEventListener('load', onLoad)
      viewer.removeEventListener('error', onError)
    }
  }, [source, reloadKey, onStatusChange])

  return <div className="model-viewer-stage" ref={mountRef} />
}
