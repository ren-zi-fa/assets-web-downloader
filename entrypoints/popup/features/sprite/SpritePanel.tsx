import { useState } from 'react';
import { Image as ImageIcon, Layers } from 'lucide-react';
import { AssetActions } from '../../components/AssetActions';
import { fileNameOf } from '../../shared/url';
import type { PanelProps } from '../registry';
import type { ScannedSprite } from './scanner';
import './SpritePanel.css';

/** Label ringkas untuk sumber sprite: sheet asli vs snapshot canvas. */
function kindLabel(sprite: ScannedSprite): string {
  return sprite.kind === 'sheet' ? 'sprite sheet' : 'canvas frame';
}

function describe(sprite: ScannedSprite): string {
  const size = sprite.width > 0 ? `${sprite.width}×${sprite.height}` : 'size?';
  return `${size} · ${kindLabel(sprite)}`;
}

/**
 * Daftar sprite hasil pemindaian.
 *
 * Preview memakai <img> untuk sprite sheet, dan <canvas> untuk snapshot —
 * agar PNG data URL berukuran besar tetap tampil tanpa mengirim data ke mana pun.
 * Hasil canvas tainted (tak bisa diunduh) ditampilkan sebagai baris keterangan.
 */
export function SpritePanel({ items, onError }: PanelProps) {
  const sprites = items as ScannedSprite[];
  const [broken, setBroken] = useState<Set<string>>(new Set());

  const markBroken = (key: string) => {
    setBroken((prev) => new Set(prev).add(key));
  };

  return (
    <ul className="ad-list">
      {sprites.map((sprite, index) => {
        const key = sprite.url || `${sprite.detail}-${index}`;
        const isSheet = sprite.kind === 'sheet';
        const showPreview = sprite.downloadable && !broken.has(key);
        return (
          <li key={key} className="ad-item ad-item-sprite">
            {showPreview ? (
              <img
                src={sprite.url}
                alt=""
                loading="lazy"
                className="ad-thumb ad-sprite-thumb"
                onError={() => markBroken(key)}
              />
            ) : (
              <div
                className="ad-thumb ad-sprite-thumb ad-sprite-broken"
                title="Preview not available"
              >
                {isSheet ? <ImageIcon size={20} /> : <Layers size={20} />}
              </div>
            )}
            <div className="ad-meta">
              <span className="ad-name" title={sprite.url || sprite.detail}>
                {sprite.url ? fileNameOf(sprite.url) : 'canvas (no file)'}
              </span>
              <span className="ad-sub">{describe(sprite)}</span>
              <span className="ad-sub">{sprite.detail}</span>
              {sprite.downloadable && sprite.url ? (
                <AssetActions
                  url={sprite.url}
                  downloadLabel={isSheet ? 'Download sheet' : 'Download frame'}
                  onError={onError}
                />
              ) : (
                <span className="ad-sub">Cannot download this canvas.</span>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
