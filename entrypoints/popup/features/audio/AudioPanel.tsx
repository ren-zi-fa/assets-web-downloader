import { AssetActions } from '../../components/AssetActions';
import { fileNameOf } from '../../shared/url';
import type { PanelProps } from '../registry';
import type { ScannedAudio } from './scanner';
import './AudioPanel.css';

function describe(track: ScannedAudio): string {
  if (track.kind === 'stream') {
    return `${track.ext || 'stream'} · playlist, not supported yet`;
  }
  if (track.kind === 'network') {
    return `${track.ext} · from network traffic`;
  }
  const parts = [track.ext, track.kind].filter(Boolean).join(' · ');
  return track.playable ? parts : `${parts} · stream, cannot be downloaded`;
}

/** Daftar hasil pemindaian audio + pemutar mini. */
export function AudioPanel({ items, onError }: PanelProps) {
  const tracks = items as ScannedAudio[];
  return (
    <ul className="ad-list">
      {tracks.map((track) => (
        <li key={track.url} className="ad-item ad-item-audio">
          <div className="ad-meta">
            <span className="ad-name" title={track.url}>
              {track.title || fileNameOf(track.url)}
            </span>
            <span className="ad-sub">{describe(track)}</span>
            {track.playable && (
              <audio controls preload="none" src={track.url} className="ad-player" />
            )}
            <AssetActions
              url={track.url}
              showDownload={track.playable && track.kind !== 'video'}
              onError={onError}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
