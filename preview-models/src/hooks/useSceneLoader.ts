import { useCallback, useState } from 'react';
import { fileNameFromUrl, formatOf, UNSUPPORTED_MESSAGE } from '../scene';
import type { SceneSource, SceneStatus } from '../scene';

export interface SceneLoader {
  source: SceneSource | null;
  status: SceneStatus;
  reloadKey: number;
  onStatusChange: (status: SceneStatus) => void;
  reload: () => void;
  openFile: (file: File) => void;
  /** Load a model from a URL; returns false when the value is blank. */
  loadUrl: (url: string) => boolean;
}

/**
 * Owns the current scene source, its loading status, and the actions that
 * mutate them (open file, load URL, reload). UI state is left to the caller.
 */
export function useSceneLoader(initial: {
  source: SceneSource | null;
  status: SceneStatus;
}): SceneLoader {
  const [source, setSource] = useState(initial.source);
  const [status, setStatus] = useState(initial.status);
  const [reloadKey, setReloadKey] = useState(0);

  const onStatusChange = useCallback((next: SceneStatus) => setStatus(next), []);

  const reload = useCallback(() => setReloadKey((key) => key + 1), []);

  const openFile = useCallback((file: File) => {
    const format = formatOf(file.name);
    if (format === 'other') {
      setStatus({ state: 'error', message: UNSUPPORTED_MESSAGE });
      return;
    }
    file
      .arrayBuffer()
      .then((buffer) =>
        setSource({ kind: 'buffer', buffer, name: file.name, size: file.size, format }),
      )
      .catch((err) =>
        setStatus({ state: 'error', message: err instanceof Error ? err.message : String(err) }),
      );
  }, []);

  const loadUrl = useCallback((url: string) => {
    const value = url.trim();
    if (!value) return false;
    const format = formatOf(value);
    if (format === 'other') {
      setStatus({ state: 'error', message: UNSUPPORTED_MESSAGE });
      return true;
    }
    setSource({ kind: 'url', url: value, name: fileNameFromUrl(value), size: 0, format });
    return true;
  }, []);

  return { source, status, reloadKey, onStatusChange, reload, openFile, loadUrl };
}
