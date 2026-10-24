import { useCallback, useRef, useState } from 'react'
import type { ChangeEvent } from 'react'
import { SplineCanvas } from './SplineCanvas'
import { ModelViewerCanvas } from './ModelViewerCanvas'
import { TopBar } from './components/TopBar'
import { UrlBar } from './components/UrlBar'
import { Toolbar } from './components/Toolbar'
import {
  DragOverlay,
  EmptyState,
  ErrorOverlay,
  Hint,
  LoadingOverlay,
} from './components/Overlays'
import { useSceneLoader } from './hooks/useSceneLoader'
import { useDragDrop } from './hooks/useDragDrop'
import { parseUrlModel } from './scene'

const FILE_ACCEPT = '.splinecode,.glb,.gltf'

function App() {
  const [initial] = useState(() => parseUrlModel(window.location.search))
  const { source, status, reloadKey, onStatusChange, reload, openFile, loadUrl } =
    useSceneLoader(initial)

  const [showUrl, setShowUrl] = useState(false)
  const [urlValue, setUrlValue] = useState('')

  const viewportRef = useRef<HTMLElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const onPickFile = useCallback(() => fileInputRef.current?.click(), [])

  const onFileInputChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) openFile(file)
      e.target.value = ''
    },
    [openFile],
  )

  const handleLoadUrl = useCallback(() => {
    if (loadUrl(urlValue)) {
      setShowUrl(false)
      setUrlValue('')
    }
  }, [loadUrl, urlValue])

  const toggleFullscreen = useCallback(() => {
    const el = viewportRef.current
    if (!el) return
    if (document.fullscreenElement) document.exitFullscreen()
    else el.requestFullscreen?.()
  }, [])

  const { dragging, onDragEnter, onDragOver, onDragLeave, onDrop } = useDragDrop(openFile)

  const meta = status.state === 'ready' ? status.meta : null

  return (
    <div className="app">
      <TopBar onOpenFile={onPickFile} onToggleUrl={() => setShowUrl((v) => !v)} />

      {showUrl && (
        <UrlBar
          value={urlValue}
          onChange={setUrlValue}
          onLoad={handleLoadUrl}
          onClose={() => setShowUrl(false)}
        />
      )}

      <main
        className="viewport"
        ref={viewportRef}
        onDragEnter={onDragEnter}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      >
        {source?.format === 'spline' && (
          <SplineCanvas source={source} reloadKey={reloadKey} onStatusChange={onStatusChange} />
        )}
        {(source?.format === 'glb' || source?.format === 'gltf') && (
          <ModelViewerCanvas source={source} reloadKey={reloadKey} onStatusChange={onStatusChange} />
        )}

        {!source && status.state !== 'error' && <EmptyState />}
        {status.state === 'loading' && <LoadingOverlay />}
        {status.state === 'error' && (
          <ErrorOverlay message={status.message} onRetry={reload} onOpenFile={onPickFile} />
        )}
        {dragging && <DragOverlay />}
        {status.state === 'ready' && <Hint />}

        <Toolbar
          meta={meta}
          sceneName={source?.name ?? 'No scene'}
          onReload={reload}
          onToggleFullscreen={toggleFullscreen}
        />
      </main>

      <input
        ref={fileInputRef}
        type="file"
        accept={FILE_ACCEPT}
        hidden
        onChange={onFileInputChange}
      />
    </div>
  )
}

export default App
