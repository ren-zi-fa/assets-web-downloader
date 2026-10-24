import type { ReactNode } from 'react';
import { Icon } from '../icons';

function DropCard({ children }: { children: ReactNode }) {
  return (
    <div className="drop-card">
      <span className="drop-icon">
        <Icon name="upload" size={28} />
      </span>
      <p>{children}</p>
    </div>
  );
}

export function EmptyState() {
  return (
    <div className="overlay">
      <DropCard>Open or drop a model to preview it</DropCard>
    </div>
  );
}

export function LoadingOverlay() {
  return (
    <div className="overlay">
      <div className="spinner" />
      <p>Loading scene…</p>
    </div>
  );
}

interface ErrorOverlayProps {
  message: string;
  onRetry: () => void;
  onOpenFile: () => void;
}

export function ErrorOverlay({ message, onRetry, onOpenFile }: ErrorOverlayProps) {
  return (
    <div className="overlay">
      <div className="error-card">
        <h2>Couldn&apos;t load the scene</h2>
        <p className="error-message">{message}</p>
        <p className="error-hint">
          Tip: if a URL fails because of CORS, download the file and open it locally instead.
        </p>
        <div className="card-actions">
          <button type="button" className="btn btn-primary" onClick={onRetry}>
            Try again
          </button>
          <button type="button" className="btn" onClick={onOpenFile}>
            Open a file
          </button>
        </div>
      </div>
    </div>
  );
}

export function DragOverlay() {
  return (
    <div className="overlay drop-overlay">
      <DropCard>
        Drop a <code>.splinecode</code>, <code>.glb</code>, or <code>.gltf</code> file
      </DropCard>
    </div>
  );
}

export function Hint() {
  return <div className="hint">Drag to rotate · Scroll to zoom · Right-drag to pan</div>;
}
