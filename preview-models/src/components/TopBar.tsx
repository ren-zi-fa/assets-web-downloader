import { Icon } from '../icons';

interface TopBarProps {
  onOpenFile: () => void;
  onToggleUrl: () => void;
}

export function TopBar({ onOpenFile, onToggleUrl }: TopBarProps) {
  return (
    <header className="topbar">
      <div className="brand">
        <span className="brand-mark">
          <Icon name="logo" size={18} />
        </span>
        <span className="brand-title">Scene Preview</span>
        <span className="brand-badge">3D</span>
      </div>

      <div className="topbar-actions">
        <button type="button" className="btn" onClick={onOpenFile}>
          <Icon name="folder" />
          Open file
        </button>
        <button type="button" className="btn" onClick={onToggleUrl}>
          <Icon name="link" />
          From URL
        </button>
      </div>

      <a className="credit" href="https://spline.design" target="_blank" rel="noreferrer">
        Made with Spline
      </a>
    </header>
  );
}
