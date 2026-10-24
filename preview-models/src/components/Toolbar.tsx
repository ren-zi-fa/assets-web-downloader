import { Icon } from '../icons';
import type { SceneMeta } from '../scene';
import { formatBytes } from '../utils/format';

interface ToolbarProps {
  meta: SceneMeta | null;
  sceneName: string;
  onReload: () => void;
  onToggleFullscreen: () => void;
}

export function Toolbar({ meta, sceneName, onReload, onToggleFullscreen }: ToolbarProps) {
  return (
    <div className="toolbar">
      <div className="scene-meta">
        {meta ? (
          <>
            <span className="scene-name" title={meta.name}>
              {meta.name}
            </span>
            <span className="scene-sep">·</span>
            <span>{formatBytes(meta.size) || 'remote'}</span>
            {meta.objects !== undefined && (
              <>
                <span className="scene-sep">·</span>
                <span>
                  {meta.objects} object{meta.objects === 1 ? '' : 's'}
                </span>
              </>
            )}
          </>
        ) : (
          <span className="scene-name">{sceneName}</span>
        )}
      </div>

      <div className="toolbar-actions">
        <button
          type="button"
          className="icon-btn"
          onClick={onReload}
          title="Reload scene"
          aria-label="Reload scene"
        >
          <Icon name="reload" />
        </button>
        <button
          type="button"
          className="icon-btn"
          onClick={onToggleFullscreen}
          title="Toggle fullscreen"
          aria-label="Toggle fullscreen"
        >
          <Icon name="fullscreen" />
        </button>
      </div>
    </div>
  );
}
