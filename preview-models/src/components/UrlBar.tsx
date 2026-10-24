interface UrlBarProps {
  value: string;
  onChange: (value: string) => void;
  onLoad: () => void;
  onClose: () => void;
}

export function UrlBar({ value, onChange, onLoad, onClose }: UrlBarProps) {
  return (
    <div className="url-bar">
      <input
        autoFocus
        value={value}
        spellCheck={false}
        placeholder="https://…/model.splinecode or .glb / .gltf"
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && onLoad()}
      />
      <button type="button" className="btn btn-primary" onClick={onLoad}>
        Load
      </button>
      <button type="button" className="btn btn-ghost" onClick={onClose}>
        Cancel
      </button>
    </div>
  );
}
