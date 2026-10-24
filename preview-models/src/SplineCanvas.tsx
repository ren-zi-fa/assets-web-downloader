import { useEffect, useRef } from 'react';
import { Application } from '@splinetool/runtime';
import type { SceneSource, SceneStatus } from './scene';

interface SplineCanvasProps {
  source: SceneSource | null;
  /** Bump this to reload the current source without changing it. */
  reloadKey: number;
  onStatusChange: (status: SceneStatus) => void;
}

/**
 * Hosts a single Spline `Application` bound to a `<canvas>`.
 *
 * The runtime sizes the canvas to fill its parent element and observes
 * resizes on its own, so the only layout requirement is a sized parent.
 */
export function SplineCanvas({ source, reloadKey, onStatusChange }: SplineCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const appRef = useRef<Application | null>(null);
  const loadSeqRef = useRef(0);

  // One Application for the lifetime of the canvas.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const app = new Application(canvas);
    appRef.current = app;
    return () => {
      appRef.current = null;
      app.dispose();
    };
  }, []);

  // (Re)load whenever the source or reload key changes.
  useEffect(() => {
    const app = appRef.current;
    if (!app || !source) return;

    const seq = ++loadSeqRef.current;
    onStatusChange({ state: 'loading' });
    let cancelled = false;

    (async () => {
      try {
        if (source.kind === 'url') {
          await app.load(source.url);
        } else {
          await app.start(source.buffer);
        }
        if (cancelled || seq !== loadSeqRef.current) return;
        onStatusChange({
          state: 'ready',
          meta: { name: source.name, size: source.size, objects: app.getAllObjects().length },
        });
      } catch (err) {
        if (cancelled || seq !== loadSeqRef.current) return;
        onStatusChange({
          state: 'error',
          message: err instanceof Error ? err.message : String(err),
        });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [source, reloadKey, onStatusChange]);

  return (
    <div className="spline-stage">
      <canvas ref={canvasRef} className="spline-canvas" />
    </div>
  );
}
