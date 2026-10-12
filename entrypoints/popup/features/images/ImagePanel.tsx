import { AssetActions } from '../../components/AssetActions';
import { fileNameOf } from '../../shared/url';
import type { PanelProps } from '../registry';
import type { ScannedImage } from './scanner';

function describe(image: ScannedImage): string {
  const size = image.width > 0 ? `${image.width}×${image.height}` : 'size?';
  return `${size} · ${image.source}`;
}

/** Daftar hasil pemindaian gambar. */
export function ImagePanel({ items, onError }: PanelProps) {
  const images = items as ScannedImage[];
  return (
    <ul className="ad-list">
      {images.map((image) => (
        <li key={image.url} className="ad-item">
          <img src={image.url} alt={image.alt} loading="lazy" className="ad-thumb" />
          <div className="ad-meta">
            <span className="ad-name" title={image.url}>
              {fileNameOf(image.url)}
            </span>
            <span className="ad-sub">{describe(image)}</span>
            <AssetActions url={image.url} onError={onError} />
          </div>
        </li>
      ))}
    </ul>
  );
}
